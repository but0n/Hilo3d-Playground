(window.webpackJsonp=window.webpackJsonp||[]).push([[149],{785:function(n,e,a){"use strict";a.r(e),e.default="function rand(min, max) {\n    return Math.random() * (max - min) + min;\n}\n\nvar geometry = new Hilo3d.PlaneGeometry();\n\nfor (var i = 0; i < 100; i++) {\n    var rect = new Hilo3d.Mesh({\n        geometry: geometry,\n        material: new Hilo3d.BasicMaterial({\n            lightType:'NONE',\n            diffuse: new Hilo3d.Color(Math.random(), Math.random(), Math.random())\n        }),\n        x: rand(-0.5, 0.5),\n        y: rand(-0.5, 0.5),\n        z: rand(-1, 1)\n    });\n    rect.setScale(rand(0.2, 0.2));\n    stage.addChild(rect);\n}\n\nvar ray = new Hilo3d.Ray();\ndocument.body.onclick = function(e){\n    var mousePos = {\n        x:e.clientX,\n        y:e.clientY\n    };\n\n    ray.fromCamera(camera, mousePos.x, mousePos.y, stage.width, stage.height);\n\n    var hitResult = stage.raycast(ray, true);\n    if(hitResult){\n        console.log(hitResult);\n        hitResult.forEach(function(raycastInfo, index){\n            var mesh = raycastInfo.mesh;\n            Hilo3d.Tween.to(mesh, {\n                scaleX:0,\n                scaleY:0\n            }, {\n                reverse:false,\n                duration:300,\n                delay:index * 250,\n                onComplete:function(){\n                    mesh.removeFromParent();\n                }\n            });\n        });\n    }\n};"}}]);