var camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    z: 4
});

var stage = new Hilo3d.Stage({
    container: document.querySelector('#container'),
    camera: camera,
    width: innerWidth,
    height: innerHeight
});

var mesh = new Hilo3d.Mesh({
    geometry: new Hilo3d.BoxGeometry(),
    material: new Hilo3d.PBRMaterial({
        baseColor:new Hilo3d.Color(0.832, 0.119, 0.093)
    }),
    onUpdate:function() {
        this.rotationY += 1;
        this.rotationX += 1;
    }
}).addTo(stage);

stage.addChild(new Hilo3d.AmbientLight({
    color: new Hilo3d.Color(1, 1, 1),
    amount: .5
})).addChild(new Hilo3d.DirectionalLight({
    color: new Hilo3d.Color(1, 1, 1),
    amount: 5,
    direction: new Hilo3d.Vector3(-1.3, -0.8, 0)
}));

var ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.start();