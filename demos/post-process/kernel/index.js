camera.far = 5;
stage.rotationX = 25;
directionLight.shadow = {};
var glTFLoader = new Hilo3d.GLTFLoader();
glTFLoader.load({
    src: 'https://ossgw.alicdn.com/tmall-c3/tmx/9d958a4e0d7f084d6b8f64e487654fdb.gltf'
}).then(function (model) {
    model.node.y = 0.2;
    model.node.setScale(0.0015);
    model.materials.map(function (m) {
        m.side = Hilo3d.constants.FRONT_AND_BACK;
    });
    model.node.onUpdate = function(){
        this.rotationY += 1;
    };
    stage.addChild(model.node);
});
var plane = new Hilo3d.Mesh({
    y: -.4,
    rotationX: -90,
    geometry: new Hilo3d.PlaneGeometry(),
    material: new Hilo3d.BasicMaterial({
        lightType:'LAMBERT',
        side: Hilo3d.constants.FRONT_AND_BACK,
        diffuse:new Hilo3d.Color(.612, .612, .612)
    })
});
plane.setScale(1.8);
stage.addChild(plane);

var time = 0;
postProcess.init(renderer);
postProcess.addPass({
    frag:'\n\
    precision HILO_MAX_FRAGMENT_PRECISION float;\n\
    varying vec2 v_texcoord0;\n\
    uniform sampler2D u_diffuse;\n\
    void main(void) {\n\
        vec4 color = texture2D(u_diffuse, v_texcoord0);\n\
        gl_FragColor = vec4(color.r * 0.3 + color.g * 0.59 + color.b * 0.11);\n\
    }',
    uniforms:{
        u_r:{
            get:function(){
                return time;
            }
        }
    }
});

var currentKernel = 'edgeDetect6';
var kernelPass = postProcess.addKernelPass(postProcess.kernels[currentKernel]);

renderer.on('afterRender', ()=>{
    time += 0.016;
    postProcess.render();
});

var kernelSelect = document.getElementById('kernelSelect');
for (var name in postProcess.kernels) {
    var opt = document.createElement('option');
    opt.innerText = name;
    opt.setAttribute('value', name);
    kernelSelect.appendChild(opt);
}

kernelSelect.value = currentKernel;
kernelSelect.addEventListener('change', function () {
    kernelPass.kernel = postProcess.kernels[kernelSelect.value];
});