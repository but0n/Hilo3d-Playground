(window.webpackJsonp=window.webpackJsonp||[]).push([[126],{732:function(n,e,o){"use strict";o.r(e),e.default="var boxGeometry = new Hilo3d.BoxGeometry();\nboxGeometry.setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]]);\n\nvar colorBox = new Hilo3d.Mesh({\n    geometry: boxGeometry,\n    material: new Hilo3d.BasicMaterial({\n        diffuse: new Hilo3d.Color(0.8, 0, 0)\n    }),\n    x: -1,\n    onUpdate: function() {\n        this.rotationX += .5;\n        this.rotationY += .5;\n    }\n});\nstage.addChild(colorBox);\n\nvar angle = 0;\nvar axis = new Hilo3d.Vector3(1, 1, 1).normalize();\nvar textureBox = new Hilo3d.Mesh({\n    geometry:boxGeometry,\n    material: new Hilo3d.BasicMaterial({\n        diffuse:new Hilo3d.LazyTexture({\n            crossOrigin:true,\n            src:'//gw.alicdn.com/tfs/TB1iNtERXXXXXcBaXXXXXXXXXXX-600-600.png'\n        })\n    }),\n    x: 1,\n    onUpdate: function() {\n        angle += Hilo3d.math.DEG2RAD;\n        this.quaternion.setAxisAngle(axis, angle);\n    }\n});\nstage.addChild(textureBox);"}}]);