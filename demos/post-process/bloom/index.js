var bloomStrength = 1.0;
var RenderPass = Hilo3d.Class.create({
    Mixes: Hilo3d.EventMixin,
    /**
     * @constructor
     * @param {WebGLRenderer} renderer
     * @param {Object} params
     * @param {Number} params.width
     * @param {Number} params.height
     * @param {Boolean} params.renderToScreen
     * @param {Object} params.framebufferOption
     */
    constructor:function(renderer, params){
        this.renderer = renderer;
        Object.assign(this, params);
        if (!this.width) {
            this.width = renderer.width;
        }

        if (!this.height) {
            this.height = renderer.height;
        }

        if (!this.renderToScreen){
            var framebuffer = this.framebuffer = new Hilo3d.Framebuffer(renderer, Object.assign({
                width:this.width,
                height:this.height
            }, params.framebufferOption));
            renderer.onInit(function(){
                framebuffer.init();
            });
        }
    },
    _render:function(renderer, lastPass){
        this.lastPass = lastPass;
        renderer.state.viewport(0, 0, this.width, this.height);
        if (this.renderToScreen) {
            renderer.state.bindSystemFramebuffer();
        } else {
            this.framebuffer.bind();
        }

        var useFramebuffer = renderer.useFramebuffer;
        renderer.useFramebuffer = false;

        this.render(renderer, lastPass);
        
        renderer.viewport();
        renderer.useFramebuffer = useFramebuffer;

        this.fire('afterRender');
    },
    /**
     * 子类需实现
     * @param  {WebGLRenderer} renderer
     */
    render:function(renderer, lastPass){

    },
    addTo(postProcessRenderer){
        postProcessRenderer.addPass(this);
        return this;
    }
});

var ScreenShaderPass = Hilo3d.Class.create({
    Extends:RenderPass,
    /**
     * @constructor
     * @param  {Object} params
     * @param {String} params.frag
     * @param {Object} params.uniforms
     */
    constructor:function(renderer, params){
        ScreenShaderPass.superclass.constructor.call(this, renderer, params);
        var that = this;
        this.scene = new Hilo3d.Node();
        this.mesh = this._createMesh().addTo(this.scene);
        this.camera = new Hilo3d.Camera();
    },
    render:function(renderer, lastPass){
        renderer.render(this.scene, this.camera);
    },
    _createMesh(){
        var that = this;
        var mesh = new Hilo3d.Mesh({
            geometry:this._createGeometry(),
            material:new Hilo3d.ShaderMaterial({
                vs:Hilo3d.Shader.shaders['screen.vert'],
                fs:this.frag,
                depthTest:false,
                side:Hilo3d.constants.FRONT_AND_BACK,
                uniforms:Object.assign({
                    u_lastTexture:{
                        get:function(mesh, material, programInfo){
                            var lastPass = that.lastPass;
                            if (lastPass && lastPass.framebuffer){
                                return Hilo3d.semantic.handlerTexture(lastPass.framebuffer.texture, programInfo.textureIndex);
                            }
                        }
                    }
                },this.uniforms)
            })
        });
        return mesh;
    },
    _createGeometry(){
        if (!this.geometry) {
            var geometry = this.geometry = new Hilo3d.Geometry({
                mode:Hilo3d.constants.TRIANGLE_STRIP
            });
            var x = - 1;
            var y = 1;
            width = 2;
            height = 2;
            const vertices = [x, y, x + width, y, x, y - height, x + width, y - height];
            geometry.vertices = new Hilo3d.GeometryData(new Float32Array(vertices), 2);
            geometry.uvs = new Hilo3d.GeometryData(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2);
        }
        return this.geometry;
    }
});

var ShaderPass = Hilo3d.Class.create({
    Extends:RenderPass,
    /**
     * @constructor
     * @param  {WebGLRenderer} renderer 
     * @param  {Object} params   
     * @param  {Object} params.forceMaterial   
     * @param  {Object} params.scene   
     * @param  {Object} params.camera   
     */
    constructor:function(renderer, params){
        ShaderPass.superclass.constructor.call(this, renderer, params);
    },
    render:function(renderer, lastPass){
        var forceMaterial = renderer.forceMaterial;
        renderer.forceMaterial = this.forceMaterial;
        renderer.render(this.scene, this.camera);
        renderer.forceMaterial = forceMaterial;
    }
});

var PostProcessRenderer = Hilo3d.Class.create({
    constructor:function(renderer){
        this.renderer = renderer;
        this.passes = [];
    },
    render:function(){
        var renderer = this.renderer;
        var lastPass;
        this.passes.forEach(function(pass, index){
            pass._render(renderer, lastPass);
            lastPass = pass;
        });

        renderer.state.bindSystemFramebuffer();
    },
    addPass:function(pass){
        this.passes.push(pass);
    },
    clear:function(){
        this.passes.length = 0;
    }
});

var postProcessRenderer = new PostProcessRenderer(renderer);
renderer.on('afterRender', function(){
    postProcessRenderer.render();
});

renderer.useFramebuffer = true;

var getLigthPass = new ScreenShaderPass(renderer, {
    frag:`
        precision HILO_MAX_FRAGMENT_PRECISION float;\n\
        varying vec2 v_texcoord0;\n\
        uniform sampler2D u_screen;\n\
        void main(void) {\n\
            vec4 color = texture2D(u_screen, v_texcoord0);\n\
            float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));\n\
            if(brightness > .4){
                gl_FragColor = vec4(color.rgb, 1.0);\n\
            }
        }
    `,
    uniforms:{
        u_screen:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(renderer.framebuffer.texture, programInfo.textureIndex)
            }
        }
    }
}).addTo(postProcessRenderer);

const blurPasses = [];
for(var i = 0;i < 5;i ++){
    (function(){
        var blurWidth = Math.ceil(renderer.width/Math.pow(2, i));
        var blurHeight = Math.ceil(renderer.height/Math.pow(2, i));
        var u_textureSize = new Float32Array([blurWidth, blurHeight]);
        var blurIndex = 0;
        var blurXPass = new ScreenShaderPass(renderer, {
            width:blurWidth,
            height:blurHeight,
            frag:`\n\
            precision HILO_MAX_FRAGMENT_PRECISION float;\n\
            uniform sampler2D u_lightTexture;
            varying vec2 v_texcoord0;\n\
            uniform vec2 u_textureSize;

            float weight[5];

            void main()
            {         
                weight[0] = 0.227027;
                weight[1] = 0.1945946;
                weight[2] = 0.1216216;
                weight[3] = 0.054054;
                weight[4] = 0.016216;
                vec2 tex_offset =  vec2(1.0/u_textureSize.x, 1.0/u_textureSize.y);
                vec3 result = texture2D(u_lightTexture, v_texcoord0).rgb * weight[0];

                for(int i = 1; i < 5; ++i){
                    result += texture2D(u_lightTexture, v_texcoord0 + vec2(vec2(tex_offset.x * float(i), 0.0))).rgb * weight[i];
                    result += texture2D(u_lightTexture, v_texcoord0 - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
                }
                       
                gl_FragColor = vec4(result, 1.0);
            }`,
            uniforms:{
                u_textureSize:{
                    get:()=> {
                        return u_textureSize;
                    }
                },
                u_lightTexture:{
                    get:(mesh, material, programInfo) => {
                        return Hilo3d.semantic.handlerTexture(getLigthPass.framebuffer.texture, programInfo.textureIndex);
                    }
                }
            }
        });
        window.blurYPass = new ScreenShaderPass(renderer, {
            width:blurWidth,
            height:blurHeight,
            framebufferOption:{
                minFilter:Hilo3d.constants.NEAREST,
                magFilter:Hilo3d.constants.LINEAR
            },
            frag:`\n\
            precision HILO_MAX_FRAGMENT_PRECISION float;\n\
            uniform sampler2D u_lastTexture;
            varying vec2 v_texcoord0;\n\
            uniform vec2 u_textureSize;

            float weight[5];

            void main()
            {         
                weight[0] = 0.227027;
                weight[1] = 0.1945946;
                weight[2] = 0.1216216;
                weight[3] = 0.054054;
                weight[4] = 0.016216;
                vec2 tex_offset =  vec2(1.0/u_textureSize.x, 1.0/u_textureSize.y);
                vec3 result = texture2D(u_lastTexture, v_texcoord0).rgb * weight[0];

                for(int i = 1; i < 5; ++i){
                    result += texture2D(u_lastTexture, v_texcoord0 + vec2(vec2(0.0, tex_offset.x * float(i)))).rgb * weight[i];
                    result += texture2D(u_lastTexture, v_texcoord0 - vec2(0.0, tex_offset.x * float(i))).rgb * weight[i];
                } 
                       
                gl_FragColor = vec4(result, 1.0);
            }`,
            uniforms:{
                u_textureSize:{
                    get:()=> {
                        return u_textureSize;
                    }
                }
            }
        });
        postProcessRenderer.addPass(blurXPass);
        postProcessRenderer.addPass(blurYPass);
        blurPasses.push(blurYPass);
    })();
}

var CombinePass = new ScreenShaderPass(renderer, {
    frag:`
        precision HILO_MAX_FRAGMENT_PRECISION float;\n\
        uniform sampler2D u_blurTexture0;
        uniform sampler2D u_blurTexture1;
        uniform sampler2D u_blurTexture2;
        uniform sampler2D u_blurTexture3;
        uniform sampler2D u_blurTexture4;
        uniform sampler2D u_scene;
        uniform float u_bloomStrength;
        varying vec2 v_texcoord0;\n\

        void main()
        {       
            vec3 color = vec3(0.0);
            color += texture2D(u_scene, v_texcoord0).rgb;      
            color += texture2D(u_blurTexture0, v_texcoord0).rgb * u_bloomStrength;
            color += texture2D(u_blurTexture1, v_texcoord0).rgb * u_bloomStrength;
            color += texture2D(u_blurTexture2, v_texcoord0).rgb * u_bloomStrength;
            color += texture2D(u_blurTexture3, v_texcoord0).rgb * u_bloomStrength;
            color += texture2D(u_blurTexture4, v_texcoord0).rgb * u_bloomStrength;
            vec3 result = color;
            result = vec3(1.0) - exp(-color * 0.8);

            gl_FragColor = vec4(result, 0);
        }
    `,
    uniforms:{
        u_scene:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(renderer.framebuffer.texture, programInfo.textureIndex)
            }
        },
        u_blurTexture0:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(blurPasses[0].framebuffer.texture, programInfo.textureIndex);
            }
        },
        u_blurTexture1:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(blurPasses[1].framebuffer.texture, programInfo.textureIndex);
            }
        },
        u_blurTexture2:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(blurPasses[2].framebuffer.texture, programInfo.textureIndex);
            }
        },
        u_blurTexture3:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(blurPasses[3].framebuffer.texture, programInfo.textureIndex);
            }
        },
        u_blurTexture4:{
            get:function(mesh, material, programInfo){
                return Hilo3d.semantic.handlerTexture(blurPasses[4].framebuffer.texture, programInfo.textureIndex);
            }
        },
        u_bloomStrength:{
            get:function(){
                return bloomStrength;
            }
        }
    },
    renderToScreen:true
}).addTo(postProcessRenderer);

var random = function(min, max){
    return Math.random() * (max - min) + min;
};
var initScene = function(){
    camera.far = 5;
    stage.rotationX = 25;
    
    var boxGeometry = new Hilo3d.BoxGeometry();
    boxGeometry.setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]]);
    var sphereGeometry = new Hilo3d.SphereGeometry({
        radius:0.7
    });

    for(var i = 0;i < 50; i ++) {
        var lightMinValue = 0.5;
        var lightMaxValue = 1;
        var colorBox = new Hilo3d.Mesh({
            geometry: random(0, 1)>0.5?boxGeometry:sphereGeometry,
            material: new Hilo3d.BasicMaterial({
                lightType:'NONE',
                diffuse: new Hilo3d.Color(random(lightMinValue, lightMaxValue), random(lightMinValue, lightMaxValue), random(lightMinValue, lightMaxValue))
            }),
            x:random(-1.5, 1.5),
            y:random(-1.5, 1.5),
            z:random(-1.5, 1.5),
            v:random(0.5, 1),
            onUpdate: function() {
                this.rotationX += this.v;
                this.rotationY += this.v;
            }
        });
        stage.addChild(colorBox);
        colorBox.setScale(random(0.05, 0.08));
    }

    stage.onUpdate = function(){
        this.rotationX += 0.5;
        this.rotationY += 0.5;
    }
}

initScene();

Hilo3d.Tween.to({num:0}, {num:0.8}, {
    ease:Hilo3d.Tween.Ease.Quad.EaseOut,
    duration:1000,
    loop: true,
    reverse: true,
    onUpdate:function(){
        bloomStrength = this.target.num;
    }
});