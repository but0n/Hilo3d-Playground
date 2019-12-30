renderer.clearColor = new Hilo3d.Color(0, 0, 0, 1);
var container = new Hilo3d.Node();
var geometry = new Hilo3d.SphereGeometry({
    radius: 1,
    heightSegments: 32,
    widthSegments: 64,
})
var mesh = new Hilo3d.Mesh({
    rotationX:90,
    time:0,
    geometry: geometry,
    material: new Hilo3d.ShaderMaterial({
        shaderCacheId: "UVAnimation",
        getCustomRenderOption(option){
            option.CUSTOM_OPTION = 1;
            return option;
        },
        needBasicUnifroms: false,
        needBasicAttributes: false,
        diffuse: new Hilo3d.LazyTexture({
            crossOrigin: true,
            src: '//gw.alicdn.com/tfs/TB1Q8dQSVXXXXciXVXXXXXXXXXX-512-512.jpg'
        }),
        mixTexture:new Hilo3d.LazyTexture({
            crossOrigin: true,
            src: '//gw.alicdn.com/tfs/TB1T1wEizTpK1RjSZKPXXa3UpXa-512-512.png'
        }),
        uniforms:{
            u_diffuse:'DIFFUSE',
            u_modelViewProjectionMatrix:'MODELVIEWPROJECTION',
            u_mixTexture:{
                get(mesh, material, programInfo) {
                    return Hilo3d.semantic.handlerTexture(material.mixTexture, programInfo.textureIndex);
                }
            },
            u_time:{
                get:function(mesh, material, programInfo){
                    return mesh.time;
                }
            },
            'u_light.color.b':{
                get:function(){
                    return Math.random() - .5;
                }
            }
        },
        attributes:{
            a_position: 'POSITION',
            a_texcoord0:'TEXCOORD_0'
        },
        fs:`
            precision HILO_MAX_FRAGMENT_PRECISION float;
            varying vec2 v_texcoord0;
            uniform sampler2D u_diffuse;
            uniform sampler2D u_mixTexture;
            uniform float u_time;
            
            struct color{
                float r;
                float g;
                float b;
            };

            struct light{
                color color;
            };
            
            uniform light u_light;
            void main(void) {
                float uOffset = sin(u_time * 0.0005);
                float vOffset = cos(u_time * 0.0003);
                vec4 diffuse = texture2D(u_diffuse, vec2(v_texcoord0.x + uOffset, v_texcoord0.y + vOffset));    
                vec4 mixTexture = texture2D(u_mixTexture, v_texcoord0);    
                gl_FragColor = mix(vec4(diffuse.r, diffuse.g, u_light.color.b, 1), mixTexture, 0.05);
            }
        `,
        vs:`
            precision HILO_MAX_VERTEX_PRECISION float;
            attribute vec3 a_position;
            attribute vec2 a_texcoord0;
            uniform mat4 u_modelViewProjectionMatrix;
            varying vec2 v_texcoord0;

            void main(void) {
                vec4 pos = vec4(a_position, 1.0);
                gl_Position = u_modelViewProjectionMatrix * pos;
                v_texcoord0 = a_texcoord0;
            }
        `
    }),
    onUpdate(dt){
        this.time += dt;
    }
});

container.addChild(mesh);
stage.addChild(container);

// stage.renderer.initContext();
// var material = mesh.material;

// // 编译
// var shader = Hilo3d.Shader.getCustomShader(material.vs, material.fs, '', material.shaderCacheId);
// shader.alwaysUse = true;
// var program = Hilo3d.Program.getProgram(, Hilo3d.Shader.renderer.state);
// program.alwaysUse = true;

// // 删除
// var shader = Hilo3d.Shader.cache.get(material.shaderCacheId);
// var program = Hilo3d.Program.cache.get(shader.id);
// shader.destroy();
// program.destroy();