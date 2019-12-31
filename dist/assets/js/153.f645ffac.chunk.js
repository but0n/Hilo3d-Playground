(window.webpackJsonp=window.webpackJsonp||[]).push([[153],{788:function(n,e,o){"use strict";o.r(e),e.default="var tweenTo = function (target, toProps, params) {\n    return new Promise(function (resolve) {\n        params.onComplete = resolve;\n        Hilo3d.Tween.to(target, toProps, params);\n    });\n};\n\ncamera.far = 5;\n\nstage.addChild(new Hilo3d.AxisNetHelper({ size: 5 }));\n\nvar loader = new Hilo3d.GLTFLoader();\nloader.load({\n    src: '//ossgw.alicdn.com/tmall-c3/tmx/a9bedc04da498b95c57057d6a5d29fe7.gltf',\n    isMultiAnim:false\n}).then(function (model) {\n    var box = new Hilo3d.Mesh({\n        geometry: new Hilo3d.BoxGeometry(),\n        material: new Hilo3d.BasicMaterial()\n    });\n\n    model.node.y = .5;\n    model.node.z = -.5;\n\n    var run = function(){\n        var node = model.node;\n        var Tween = Hilo3d.Tween;\n        Tween.to(node, { z: 0.5 }, { duration: 2000 })\n        .link(Tween.to(node, { rotationX: 90 }, { duration: 500, delay:'+0' }))\n        .link(Tween.to(node, { y: -.5 }, { duration: 2000, delay:'+0' }))\n        .link(Tween.to(node, { rotationX: 180 }, { duration: 500, delay:'+0' }))\n        .link(Tween.to(node, { z: -.5 }, { duration: 2000, delay:'+0' }))\n        .link(Tween.to(node, { rotationX: 270 }, { duration: 500, delay:'+0' }))\n        .link(Tween.to(node, { y: .5 }, { duration: 2000, delay:'+0' }))\n        .link(Tween.to(node, { rotationX: 360 }, { duration: 500, delay:'+0', onComplete:function(){\n            node.rotationX = 0;\n            run();\n        }}))\n    }            \n\n    run();\n    stage.addChild(box);\n    stage.addChild(model.node);\n});\n\nnew Hilo3d.DirectionalLight({\n    color:new Hilo3d.Color(1, 1, 1),\n    direction:new Hilo3d.Vector3(0, -1, 1),\n    shadow: {\n        // debug: true,\n    }\n}).addTo(stage);\n\nnew Hilo3d.AmbientLight({\n    color:new Hilo3d.Color(1, 1, 1),\n    amount: .5\n}).addTo(stage);"}}]);