var camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 200,
    z: 10,
});
var backgroundColor = new Hilo3d.Color(0.6,0.8,0.9);
var stage = new Hilo3d.Stage({
    container: document.querySelector('#container'),
    camera: camera,
    width: innerWidth,
    height: innerHeight,
    clearColor:backgroundColor,
    fog:new Hilo3d.Fog({
        mode:'EXP2', // LINEAR, EXP, EXP2
        start:5,
        end:15,
        density:0.1,
        color:backgroundColor
    }),
    useInstanced:true
});

var ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.addTick(Hilo3d.Tween);
ticker.start();

var stats = new Stats(ticker, stage.renderer.renderInfo);
var orbitControls = new OrbitControls(stage);

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var loader = new Hilo3d.BasicLoader();
loader.load({
    src: '//gw.alicdn.com/tfs/TB1T1wEizTpK1RjSZKPXXa3UpXa-512-512.png',
}).then(function(image) {
    return new Hilo3d.Texture({ image: image });
}, function(err) {
    return new Hilo3d.Color(1, 0, 0);
}).then(function(diffuse) {
    var material = new Hilo3d.PBRMaterial({ 
        lightType: 'NONE',
        baseColorMap : diffuse,
        side:Hilo3d.constants.FRONT_AND_BACK
    });
    var geometry = new Hilo3d.PlaneGeometry();

    for (var i = 0; i < 100; i++) {
        let r = 5;
        var rect = new Hilo3d.Mesh({
            useInstanced:true,
            geometry: geometry,
            material: Math.random() < .5 ? material : new Hilo3d.BasicMaterial({
                lightType: 'NONE',
                diffuse: new Hilo3d.Color(Math.random(), Math.random(), Math.random()),
                side:Hilo3d.constants.FRONT_AND_BACK
            }),
            x: randInt(-r, r),
            y: randInt(-r, r),
            z: randInt(-r, r)
        });
        rect.rotationX = Math.random() * 360;
        rect.rotationY = Math.random() * 360;
        rect.rotationZ = Math.random() * 360;
        rect.setScale(randInt(1, 2));
        stage.addChild(rect);
    }
});