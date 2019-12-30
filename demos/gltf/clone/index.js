renderer.useInstanced = true;
var loader = new Hilo3d.GLTFLoader();
loader.load({
    name: 'JPN',
    useInstanced: true,
    src: '//ossgw.alicdn.com/tmall-c3/tmx/9d958a4e0d7f084d6b8f64e487654fdb.gltf'
}).then(function (model) {
    var node = model.node;
    node.setScale(0.002);
    stage.addChild(node);
    for (var i = 0; i < 100; i++) {
        var cloneNode = node.clone();
        cloneNode.anim.timeScale = Math.random();
        cloneNode.setScale(0.0005);
        cloneNode.x = Math.random() * 2 - 1;
        cloneNode.y = Math.random() * 2 - 1;
        cloneNode.z = Math.random() * 2 - 1;
        stage.addChild(cloneNode);
    }
});

stage.addChild(new Hilo3d.AxisNetHelper({ size: 4 }));