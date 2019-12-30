function $(id) {
    return document.getElementById(id);
}
var camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 3,
    near: 0.1,
    z: 1
});

camera.lookAt({ x: 0, y: 0, z: 0 });
var stage = new Hilo3d.Stage({
    container: document.getElementById('container'),
    camera: camera,
    width: innerWidth,
    height: innerHeight,
    useFramebuffer: false,
    useInstanced: false,
    useVao: true,
    rotationX: 30
});

stage.addChild(new Hilo3d.AxisHelper({ size: 0.1 }));

var ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.addTick(Hilo3d.Tween);
ticker.addTick(Hilo3d.Animation);


var glTFLoader = new Hilo3d.GLTFLoader();
glTFLoader.load({
    src: '//ossgw.alicdn.com/tmall-c3/tmx/a9bedc04da498b95c57057d6a5d29fe7.gltf',
    isMultiAnim:false
}).then(function (model) {
    window.xx = model;
    stage.addChild(model.node);
});

var loader = new Hilo3d.BasicLoader();
loader.load({
    crossOrigin: 'anonymous',
    src: '//img.alicdn.com/tfs/TB1aNxtQpXXXXX1XVXXXXXXXXXX-1024-1024.jpg'
}).then(function(img){
    var geometry = new Hilo3d.PlaneGeometry();

    var wall = new Hilo3d.Mesh({
        rotationX: -90,
        geometry: geometry,
        material: new Hilo3d.BasicMaterial({
            diffuse: new Hilo3d.Texture({
                image: img
            })
        })
    });
    wall.setScale(1);
    stage.addChild(wall);
});

var light = new Hilo3d.SpotLight({
    x: 0,
    y: 1,
    z: 0,
    color: new Hilo3d.Color(1, 0, 0),
    direction: new Hilo3d.Vector3(0.4, -1, 0),
    cutoff: 1,
    outerCutoff: 4,
    range:100,
    onUpdate: function () {
        light.direction.rotateY(new Hilo3d.Vector3(), 0.01)
        light.lightShadow && light.lightShadow.updateLightCamera(stage.camera);
    },
    shadow: {}
}).addTo(stage);

spotlight=new Hilo3d.SpotLight({
    x: -0,
    y: 1,
    z: 0,
    color:new Hilo3d.Color(0, 1, 0),
    direction:new Hilo3d.Vector3(0, -1, 0),
    cutoff: 20,
    outerCutoff: 24,
    range:20,
    shadow: {
        // debug: true
    }
}).addTo(stage);

light.addChild(new Hilo3d.Mesh({
    geometry: new Hilo3d.BoxGeometry({
        width: 0.01,
        height: 0.01,
        depth: 0.01
    }),
    material: new Hilo3d.BasicMaterial()
}))

var box = new Hilo3d.Mesh({
    geometry: new Hilo3d.BoxGeometry(),
    material: new Hilo3d.BasicMaterial(),
    x: 0.2,
    y: .3,
    z: 0.2
}).addTo(stage);
box.onUpdate = function () {
    box.rotationX++;
    box.rotationY++;
}
box.setScale(0.1);

new Hilo3d.AmbientLight({
    color:new Hilo3d.Color(1, 1, 1),
    amount: .5
}).addTo(stage);

var stats = new Stats(ticker, stage.renderer.renderInfo);
var orbitControls = new OrbitControls(stage, {
    isLockMove:true,
    isLockZ:true
});

ticker.start();