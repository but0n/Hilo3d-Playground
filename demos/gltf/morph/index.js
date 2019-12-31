camera.far = 5;
stage.rotationX = 45;
directionLight.shadow = {};
var glTFLoader = new Hilo3d.GLTFLoader();
glTFLoader.load({
    src: 'https://ossgw.alicdn.com/tmall-c3/tmx/2dad5b25faf1bece0e4c756a9057dabb.gltf'
}).then(function (model) {
    window.model = model;
    model.node.setScale(0.008);
    model.materials.map(function (m) {
        m.side = Hilo3d.constants.FRONT_AND_BACK;
    });
    model.node.onUpdate = function(){
        this.rotationY += 1;
    };
    stage.addChild(model.node);
    model.node.pivotZ = -30;
    model.node.z = -model.node.pivotZ;
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