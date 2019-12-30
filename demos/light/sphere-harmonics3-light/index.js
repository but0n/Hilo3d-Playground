initModel();
initLight();

function initModel(){
    var sh3Data = [[1.8839140747279468,1.2336689528140037,1.6815759445875258],[1.0005113784288704,0.8691400255493019,1.4887876533795357],[0.5603794677467341,0.2578132145126057,0.19374826573501497],[1.3072342827477732,0.6636485650699964,0.6695344061570127],[0.5640030294080713,0.37938937249123666,0.49194331732327273],[0.27256774141207746,0.143343904079048,0.1155890697070088],[-0.1381991414602802,-0.057096853570897485,-0.04879314267934546],[0.5350810043540868,0.263230477756704,0.24531039907656563],[0.43283339060831905,0.12637845128810607,-0.0041528480118368585]];
    var sh3 = new Hilo3d.SphericalHarmonics3().fromArray(sh3Data).scaleForRender();
    var node = new Hilo3d.Node();
    node.setScale(0.2);
    stage.addChild(node);

    var geometry = new Hilo3d.SphereGeometry({
        radius: 0.45,
        heightSegments: 16,
        widthSegments: 32
    });

   var colors = [
        [0.56, 0.57, 0.58], //铁
        [0.95, 0.64, 0.54], //铜
        [1, 0.71, 0.29], //金
        [0.95, 0.93, 0.88], //银
    ];

    var num = 8;
    for(var i = 0;i < num; i ++){
        for(var j = 0;j < num;j ++){
            var x = i - num*.5;
            var y = j - num*.5;
            var metallic = i/num;
            var roughness = j/num;
            var len = colors.length;
            colors.forEach(function(color, index){
                material = new Hilo3d.PBRMaterial({
                    baseColor: new Hilo3d.Color(color[0], color[1], color[2]),
                    metallic: metallic,
                    roughness: roughness,
                    diffuseEnvSphereHarmonics3: sh3
                });

                var mesh = new Hilo3d.Mesh({
                    geometry: geometry,
                    material: material,
                    x:x,
                    y:y,
                    z:(index - len * .5) * 2
                });

                node.addChild(mesh);
            });
        }
    }
}

function initLight(){
    ambientLight.amount = 0.03;

    var pointLight = new Hilo3d.PointLight({
        color:new Hilo3d.Color(.3, .3, .3),
        x:5,
        y:0,
        z:5,
        range:500
    });
    stage.addChild(pointLight);

    Hilo3d.Tween.to(pointLight, {
        x:-5
    }, {
        duration:2000,
        loop:true,
        reverse:true
    });
}