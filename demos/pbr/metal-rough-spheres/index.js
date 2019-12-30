initModel();
initLight();

function initModel(){
    var loadQueue = new Hilo3d.LoadQueue([{
        type: 'CubeTexture',
        images: [
            './image/bakedDiffuse_01.jpg',
            './image/bakedDiffuse_02.jpg',
            './image/bakedDiffuse_03.jpg',
            './image/bakedDiffuse_04.jpg',
            './image/bakedDiffuse_05.jpg',
            './image/bakedDiffuse_06.jpg'
        ]
    }, {
        type: 'CubeTexture',
        right: './image/px.jpg',
        left: './image/nx.jpg',
        top: './image/py.jpg',
        bottom: './image/ny.jpg',
        front: './image/pz.jpg',
        back: './image/nz.jpg',
        magFilter: Hilo3d.constants.LINEAR,
        minFilter: Hilo3d.constants.LINEAR_MIPMAP_LINEAR
    },{
        src: './image/brdfLUT.png',
        wrapS: Hilo3d.constants.CLAMP_TO_EDGE,
        wrapT: Hilo3d.constants.CLAMP_TO_EDGE,
        type:'Texture'
    }]).start().on('complete', function(){
        var result = loadQueue.getAllContent();
        var diffuseEnvMap = result[0];
        var specularEnvMap = result[1];
        var brdfTexture = result[2];

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
                        brdfLUT: brdfTexture,
                        diffuseEnvMap: diffuseEnvMap,
                        specularEnvMap: specularEnvMap
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


        var skyBox = new Hilo3d.Mesh({
            geometry: new Hilo3d.BoxGeometry(),
            material: new Hilo3d.BasicMaterial({
                lightType: 'NONE',
                side: Hilo3d.constants.BACK,
                diffuse: specularEnvMap
            })
        }).addTo(stage);
        skyBox.setScale(20);
    });
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