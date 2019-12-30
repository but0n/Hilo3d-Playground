var tweenTo = function (target, toProps, params) {
    return new Promise(function (resolve) {
        params.onComplete = resolve;
        Hilo3d.Tween.to(target, toProps, params);
    });
};

camera.far = 5;

stage.addChild(new Hilo3d.AxisNetHelper({ size: 5 }));

var loader = new Hilo3d.GLTFLoader();
loader.load({
    src: '//ossgw.alicdn.com/tmall-c3/tmx/a9bedc04da498b95c57057d6a5d29fe7.gltf',
    isMultiAnim:false
}).then(function (model) {
    var box = new Hilo3d.Mesh({
        geometry: new Hilo3d.BoxGeometry(),
        material: new Hilo3d.BasicMaterial()
    });

    model.node.y = .5;
    model.node.z = -.5;

    var run = function(){
        var node = model.node;
        var Tween = Hilo3d.Tween;
        Tween.to(node, { z: 0.5 }, { duration: 2000 })
        .link(Tween.to(node, { rotationX: 90 }, { duration: 500, delay:'+0' }))
        .link(Tween.to(node, { y: -.5 }, { duration: 2000, delay:'+0' }))
        .link(Tween.to(node, { rotationX: 180 }, { duration: 500, delay:'+0' }))
        .link(Tween.to(node, { z: -.5 }, { duration: 2000, delay:'+0' }))
        .link(Tween.to(node, { rotationX: 270 }, { duration: 500, delay:'+0' }))
        .link(Tween.to(node, { y: .5 }, { duration: 2000, delay:'+0' }))
        .link(Tween.to(node, { rotationX: 360 }, { duration: 500, delay:'+0', onComplete:function(){
            node.rotationX = 0;
            run();
        }}))
    }            

    run();
    stage.addChild(box);
    stage.addChild(model.node);
});

new Hilo3d.DirectionalLight({
    color:new Hilo3d.Color(1, 1, 1),
    direction:new Hilo3d.Vector3(0, -1, 1),
    shadow: {
        // debug: true,
    }
}).addTo(stage);

new Hilo3d.AmbientLight({
    color:new Hilo3d.Color(1, 1, 1),
    amount: .5
}).addTo(stage);