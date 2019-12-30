camera.fov = 45;
camera.near = 1;
camera.far = 1000;
camera.position.set(0, 10, 40);

directionLight.enabled = false;
ambientLight.enabled = false;

var createWall = function(){
    var geometry = new Hilo3d.BoxGeometry({
        width: 30,
        height: 30,
        depth: 30
    });

    var material = new Hilo3d.PBRMaterial({
        baseColor: new Hilo3d.Color().fromHEX('fff'),
        side: Hilo3d.constants.BACK,
        castShadows: false,
        receiveShadows: true
    });

    var mesh = new Hilo3d.Mesh({
        geometry:geometry,
        material:material,
        y: 10
    });

    return mesh;
};

var lightNum = 0;
var sphereGeometry = new Hilo3d.SphereGeometry();
var boxGeometry = new Hilo3d.BoxGeometry();
var boxMaterial = new Hilo3d.PBRMaterial({
    castShadows: true,
    receiveShadows: true,
    roughness:0.5,
    metallic:0
});
var createLight = function(color) {
    lightNum ++;
    var amount = 100 + 2 * Math.random();

    var pointLight = new Hilo3d.PointLight({
        time:lightNum * 666,
        color: color,
        amount:amount,
        range: 100,
        shadow: {
            minBias: 0.1
        },
        onUpdate:function(dt){
            var time = this.time = this.time + dt * 0.001;
            this.x = Math.sin( time * 0.6 ) * 9;
            this.y = Math.sin( time * 0.7 ) * 9;
            this.z = Math.sin( time * 0.8 ) * 9;

            this.rotationX = time * 50;
            this.rotationZ = time * 50;
        },
        rotationZ:240
    });
                
    // light mesh
    new Hilo3d.Mesh({
        geometry: sphereGeometry,
        material: new Hilo3d.BasicMaterial({
            diffuse: color.clone().scale(amount), 
            lightType:'NONE',
            castShadows: false,
            receiveShadows: false
        })
    }).setScale(0.3).addTo(pointLight);

    // box mesh
    new Hilo3d.Mesh({
        geometry: Math.random()>0.4?boxGeometry:sphereGeometry,
        material: boxMaterial,
        y:Math.random() * 2 + 3,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
        onUpdate(){
            this.rotationX += 1;
            this.rotationY += 1;
        }
    }).addTo(pointLight).setScale(1);

    return pointLight;
};

var wall = createWall().addTo(stage);
var pointLight0 = createLight(new Hilo3d.Color().fromHEX('0000ff')).addTo(wall);
createLight(new Hilo3d.Color().fromHEX('ff0000')).addTo(wall);
createLight(new Hilo3d.Color().fromHEX('00ff00')).addTo(wall);