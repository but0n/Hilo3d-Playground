renderer.on('init', function() {
    console.log('init');
    scale = 8;
    width = Math.floor(innerWidth / scale);
    height = Math.floor(innerHeight / scale)
    totalTile = width * height;
    lifegameData = new Uint8Array(totalTile * 4);
    for (var i = 0; i < totalTile; i++) {
        lifegameData[i * 4 + 2] = Math.random() < 0.6 ? 255 : 0;
    }

    lifegameFramebuffer = new Hilo3d.Framebuffer(renderer, {
        needRenderbuffer: false,
        width: width,
        height: height,
        data: lifegameData
    });

    lifegameFramebuffer.bind();
    lifegameFramebuffer.backTexture = lifegameFramebuffer.texture;
    lifegameFramebuffer.frontTexture = lifegameFramebuffer.createTexture();
    lifegameFramebuffer.unbind();
});

postProcess.init(renderer);
renderer.on('afterRender', function() {
    lifegameFramebuffer.bind();
    lifegameFramebuffer.texture = lifegameFramebuffer.backTexture;
    renderer.gl.framebufferTexture2D(renderer.gl.FRAMEBUFFER, lifegameFramebuffer.attachment, lifegameFramebuffer.target, lifegameFramebuffer.texture.getGLTexture(renderer.state), 0);

    postProcess.draw(lifegameFramebuffer.frontTexture, {
        uniforms: {
            u_size: new Float32Array([width, height])
        },
        frag: `
            precision HILO_MAX_FRAGMENT_PRECISION float;
            varying vec2 v_texcoord0;
            uniform sampler2D u_diffuse;
            uniform vec2 u_size;
            int get(int x, int y) {
                return int(texture2D(u_diffuse, (gl_FragCoord.xy + vec2(x, y)) / u_size).b);
            }

            void main(void) {
                int sum = get(-1, -1) +
                      get(-1,  0) +
                      get(-1,  1) +
                      get( 0, -1) +
                      get( 0,  1) +
                      get( 1, -1) +
                      get( 1,  0) +
                      get( 1,  1);

                if (sum == 3) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                } else if (sum == 2) {
                    float current = float(get(0, 0));
                    gl_FragColor = vec4(current, current, current, 1.0);
                } else {
                    gl_FragColor = vec4(.0, .0, .0, .0);
                }
            }
        `
    });

    var temp = lifegameFramebuffer.backTexture;
    lifegameFramebuffer.backTexture = lifegameFramebuffer.frontTexture;
    lifegameFramebuffer.frontTexture = temp;

    lifegameFramebuffer.unbind()
    lifegameFramebuffer.render();
});

document.addEventListener('click', function(e) {
    var x = Math.floor(e.offsetX / scale);
    var y = Math.floor(height - e.offsetY / scale);
    x = Math.min(width - 1, x);
    y = Math.min(height - 1, y);

    gl.bindTexture(gl.TEXTURE_2D, lifegameFramebuffer.frontTexture.getGLTexture(renderer.state));
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1,
        gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255]));
    gl.bindTexture(gl.TEXTURE_2D, lifegameFramebuffer.backTexture.getGLTexture(renderer.state));
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1,
        gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 255, 255, 255]));
});

ticker._targetFPS = 24;
ticker._interval = 1000 / ticker._targetFPS;