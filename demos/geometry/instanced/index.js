renderer.useInstanced = true;
renderer.useVao = true;

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randArr(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

var loader = new Hilo3d.BasicLoader();
loader.load({
    src: '//gw.alicdn.com/tfs/TB1T1wEizTpK1RjSZKPXXa3UpXa-512-512.png',
    crossOrigin: 'anonymous',
    useInstanced:true
}).then(function(image) {
    return new Hilo3d.Texture({ image: image });
}, function(err) {
    return new Hilo3d.Color(1, 0, 0);
}).then(function(diffuse) {
    var textureMaterial = new Hilo3d.BasicMaterial({ 
        diffuse : diffuse,
        side:Hilo3d.constants.FRONT_AND_BACK
    });
    var colorMaterial = new Hilo3d.BasicMaterial({ 
        diffuse : new Hilo3d.Color(0.3, 0.6, 0.9),
        side:Hilo3d.constants.FRONT_AND_BACK
    });
    var planeGeometry = new Hilo3d.PlaneGeometry();
    var sphereGeometry = new Hilo3d.SphereGeometry({
        radius:0.3
    });
    var boxGeometry = new Hilo3d.BoxGeometry({
        width:0.3,
        height:0.3,
        depth:0.3
    });
    boxGeometry.setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]]);

    var geometryes = [planeGeometry, sphereGeometry, boxGeometry];
    var materials = [colorMaterial, textureMaterial];

    for (var i = 0; i < 200; i++) {
        let r = 1;
        var rect = new Hilo3d.Mesh({
            useInstanced: true,
            geometry: randArr(geometryes),
            material: randArr(materials),
            x: rand(-r, r),
            y: rand(-r, r),
            z: rand(-r, r)
        });
        rect.rotationX = Math.random() * 360;
        rect.rotationY = Math.random() * 360;
        rect.rotationZ = Math.random() * 360;
        rect.setScale(rand(0.2, 0.3));
        stage.addChild(rect);
    }
});