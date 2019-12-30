var boxGeometry = new Hilo3d.BoxGeometry();
boxGeometry.setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]]);

var material = new Hilo3d.BasicMaterial({
    diffuse:new Hilo3d.LazyTexture({
        crossOrigin:true,
        src:'//gw.alicdn.com/tfs/TB1iNtERXXXXXcBaXXXXXXXXXXX-600-600.png'
    })
});

var redMaterial = new Hilo3d.BasicMaterial({
    diffuse:new Hilo3d.Color(1, 0, 0)
});

var originMesh = new Hilo3d.Mesh({
    geometry: boxGeometry,
    material: material,
    x: -.8,
    rotationY:30
}).addTo(stage).setScale(0.1);

var geometryGetters = [
    () => new Hilo3d.PlaneGeometry(),
    () => new Hilo3d.SphereGeometry({
        radius:0.3
    }),
    () => new Hilo3d.BoxGeometry({
        width:0.3,
        height:0.3,
        depth:0.3
    }).setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]])
];

var rand = function(a, b){
    return a + Math.random() * (b - a);
};
var randGeometry = function(){
    return geometryGetters[Math.floor(Math.random()*geometryGetters.length)]();
};

const invertMatrix = new Hilo3d.Matrix4().invert(originMesh.matrix);
var tempMatrix = new Hilo3d.Matrix4();
for (var i = 0; i < 100; i++) {
    (function(){
        let r = 0.9;
        var randomMesh = new Hilo3d.Mesh({
            geometry: randGeometry(),
            material: material,
            x: rand(-r, r),
            y: rand(-r, r),
            z: rand(-r, r)
        });
        randomMesh.rotationX = Math.random() * 360;
        randomMesh.rotationY = Math.random() * 360;
        randomMesh.rotationZ = Math.random() * 360;
        randomMesh.setScale(rand(0.3, 0.4));
        stage.addChild(randomMesh);
        ticker.timeout(function(){
            randomMesh.material = redMaterial;
            ticker.timeout(function(){
                randomMesh.removeFromParent();
                boxGeometry.merge(randomMesh.geometry, tempMatrix.copy(invertMatrix).multiply(randomMesh.matrix));
                boxGeometry.getLocalSphereBounds(true);
            }, 300);
        }, i * 30 + 2000);
    })(i);
}