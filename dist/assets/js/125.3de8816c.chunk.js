(window.webpackJsonp=window.webpackJsonp||[]).push([[125],{731:function(n,e,i){"use strict";i.r(e),e.default="var camera = new Hilo3d.PerspectiveCamera({\n    aspect: innerWidth / innerHeight,\n    z: 4\n});\n\nvar stage = new Hilo3d.Stage({\n    container: document.querySelector('#container'),\n    camera: camera,\n    width: innerWidth,\n    height: innerHeight\n});\n\nvar mesh = new Hilo3d.Mesh({\n    geometry: new Hilo3d.BoxGeometry(),\n    material: new Hilo3d.PBRMaterial({\n        baseColor:new Hilo3d.Color(0.832, 0.119, 0.093),\n        baseColorMap: new Hilo3d.LazyTexture({\n            src:'/image/UV_Grid_Sm.jpg'\n        })\n    }),\n    onUpdate:function() {\n        this.rotationY += 1;\n        this.rotationX += 1;\n    }\n}).addTo(stage);\n\nstage.addChild(new Hilo3d.AmbientLight({\n    color: new Hilo3d.Color(1, 1, 1),\n    amount: .5\n})).addChild(new Hilo3d.DirectionalLight({\n    color: new Hilo3d.Color(1, 1, 1),\n    amount: 5,\n    direction: new Hilo3d.Vector3(-1.3, -0.8, 0)\n}));\n\nvar ticker = new Hilo3d.Ticker(60);\nticker.addTick(stage);\nticker.start();"}}]);