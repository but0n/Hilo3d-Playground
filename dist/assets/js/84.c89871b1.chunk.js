(window.webpackJsonp=window.webpackJsonp||[]).push([[84],{519:function(e,n,r){"use strict";r.r(n),n.default="var framebufferOption = {\n    type:Hilo3d.constants.FLOAT\n};\nrenderer.framebufferOption = framebufferOption;\nrenderer.clearColor = new Hilo3d.Color(0, 0, 0, 0);\npostProcess.init(renderer, framebufferOption);\nrenderer.useFramebuffer = false;\nrenderer.useInstanced = true;\n\ninitScene();\n\nfunction initSSAO(meshes){\n    var num = 32;\n    var ssaoKernel = new Float32Array(num * 3);\n    for(var i = 0;i < num;i ++){\n        var index = i * 3;\n        var scale = Math.random() * 0.9 + 0.1;\n        ssaoKernel[index] = (Math.random() * 2 -1) * scale;\n        ssaoKernel[index + 1] = (Math.random() * 2 -1) * scale;\n        ssaoKernel[index + 2] = Math.random() * scale;\n    }\n    var writeOriginData = true;\n    var positionFramebuffer = new Hilo3d.Framebuffer(renderer, {\n        type:Hilo3d.constants.FLOAT\n    });\n    positionFramebuffer.init();\n    var positionMaterial = new Hilo3d.GeometryMaterial({\n        vertexType:Hilo3d.constants.POSITION,\n        writeOriginData:writeOriginData\n    });\n\n    var normalFramebuffer = new Hilo3d.Framebuffer(renderer, {\n        type:Hilo3d.constants.FLOAT\n    });\n    normalFramebuffer.init();\n    var normalMaterial = new Hilo3d.GeometryMaterial({\n        vertexType:Hilo3d.constants.NORMAL,\n        writeOriginData:writeOriginData\n    });\n\n    var depthFramebuffer = new Hilo3d.Framebuffer(renderer, {\n        type:Hilo3d.constants.FLOAT\n    });\n    depthFramebuffer.init();\n    var depthMaterial = new Hilo3d.GeometryMaterial({\n        vertexType:Hilo3d.constants.DEPTH,\n        writeOriginData:false\n    });\n\n    var ssaoFramebuffer = new Hilo3d.Framebuffer(renderer, {\n        type:Hilo3d.constants.FLOAT\n    });\n    ssaoFramebuffer.init();\n\n    var noiseData = new Float32Array(48);\n    for (var i = 0; i < 48; i++) {\n        noiseData[i] = Math.random() * 2 - 1;\n    }\n    var noiseTexture = new Hilo3d.DataTexture({\n        data: noiseData,\n        wrapS:Hilo3d.constants.REPEAT,\n        wrapT:Hilo3d.constants.REPEAT\n    });\n    var textureSize = new Float32Array([renderer.width, renderer.height]);\n    var noiseScale = new Float32Array([renderer.width/4, renderer.height/4]);\n\n    var ssaoPass = postProcess.addPass({\n        frag:`\n        precision HILO_MAX_FRAGMENT_PRECISION float;\n        varying vec2 v_texcoord0;\n        uniform sampler2D u_normal;\n        uniform sampler2D u_position;\n        uniform sampler2D u_depth;\n        uniform sampler2D u_noise;\n        uniform vec3 u_kernel[32];\n        uniform mat4 u_projection;\n        uniform vec2 u_noiseScale;\n        uniform float u_radius;\n        void main(void) {\n            vec4 fragPosAll = texture2D(u_position, v_texcoord0);\n            if(fragPosAll.a < 1.0){\n                discard;\n            }\n            vec3 fragPos = fragPosAll.xyz;\n            vec3 normal = texture2D(u_normal, v_texcoord0).xyz;\n            vec3 randomVec = texture2D(u_noise, v_texcoord0 * u_noiseScale).xyz;\n            vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));\n            vec3 bitangent = cross(normal, tangent);\n            mat3 TBN = mat3(tangent, bitangent, normal);\n            \n            float occlusion = 0.0;\n            for(int i = 0; i < 32; ++i)\n            {\n                // \u83b7\u53d6\u6837\u672c\u4f4d\u7f6e\n                vec3 sample = TBN * u_kernel[i]; // \u5207\u7ebf->\u89c2\u5bdf\u7a7a\u95f4\n                sample = fragPos + sample * u_radius; \n\n                vec4 offset = vec4(sample, 1.0);\n                offset = u_projection * offset; // \u89c2\u5bdf->\u88c1\u526a\u7a7a\u95f4\n                offset.xyz /= offset.w; // \u900f\u89c6\u5212\u5206\n                offset.xyz = offset.xyz * 0.5 + 0.5; // \u53d8\u6362\u52300.0 - 1.0\u7684\u503c\u57df\n                \n                float sampleDepth = -texture2D(u_depth, offset.xy).x;\n                float rangeCheck = smoothstep(0.0, 1.0, u_radius / abs(fragPos.z - sampleDepth));\n                occlusion += (sampleDepth >= sample.z ? 1.0 : 0.0) * rangeCheck;    \n            }\n            occlusion = 1.0 - (occlusion / 32.0);\n            gl_FragColor = vec4(vec3(occlusion), 1.0);\n        }`,\n        uniforms:{\n            u_position:postProcess.uniformTextureGetter(positionFramebuffer.texture),\n            u_normal:postProcess.uniformTextureGetter(normalFramebuffer.texture),\n            u_depth:postProcess.uniformTextureGetter(depthFramebuffer.texture),\n            u_noise:postProcess.uniformTextureGetter(noiseTexture),\n            u_kernel:ssaoKernel,\n            u_radius:.1,\n            u_noiseScale:noiseScale,\n            u_projection:{\n                get:function(){\n                    return camera.projectionMatrix.elements;\n                }\n            }\n        }\n    });\n\n    var blurPass = postProcess.addPass({\n        frag:`\n            precision HILO_MAX_FRAGMENT_PRECISION float;\n            varying vec2 v_texcoord0;\n            uniform sampler2D u_ssao;\n            uniform vec2 u_textureSize;\n            void main(void) {\n                gl_FragColor = texture2D(u_ssao, v_texcoord0);\n                gl_FragColor = vec4(1.0);\n                vec2 texelSize = 1.0 / u_textureSize;\n                float result = 0.0;\n                for (int x = -2; x < 2; ++x) \n                {\n                    for (int y = -2; y < 2; ++y) \n                    {\n                        vec2 offset = vec2(float(x), float(y)) * texelSize;\n                        result += texture2D(u_ssao, v_texcoord0 + offset).r;\n                    }\n                }\n                gl_FragColor = vec4(vec3(result / (4.0 * 4.0)), 1.0);\n            }\n        `,\n        uniforms:{\n            u_ssao:postProcess.uniformTextureGetter(ssaoFramebuffer.texture),\n            u_textureSize:textureSize\n        }\n    });\n\n    renderer.forceMaterial = depthMaterial;\n\n    renderer.on('afterRender', function(){\n        var forceMaterial = renderer.forceMaterial;\n\n        positionFramebuffer.bind();\n        positionFramebuffer.clear();\n        renderer.forceMaterial = positionMaterial;\n        renderer.renderScene();\n\n        normalFramebuffer.bind();\n        normalFramebuffer.clear();\n        renderer.forceMaterial = normalMaterial;\n        renderer.renderScene();\n\n        depthFramebuffer.bind();\n        depthFramebuffer.clear();\n        renderer.forceMaterial = depthMaterial;\n        renderer.renderScene();\n\n        renderer.forceMaterial = forceMaterial;\n\n        ssaoFramebuffer.bind();\n        ssaoFramebuffer.clear();\n        postProcess.draw(null, ssaoPass);\n        \n        renderer.state.bindSystemFramebuffer();\n        postProcess.draw(null, blurPass);\n    });\n}\n\nrenderer.on('init', function(){\n    initSSAO();\n});\n\nfunction initScene(){\n    var loader = new Hilo3d.GLTFLoader();\n    loader.load({\n        src: './models/dragon/dragon.gltf'\n    }).then(function(model){\n        model.node.setScale(0.1);\n        stage.addChild(model.node);\n    });\n}"}}]);