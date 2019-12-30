var loader = new Hilo3d.GLTFLoader();
loader.load({
    src: '//cx.alicdn.com/tmx/36c8c69b771f42ca692ded534d764b77.gltf'
}).then(function(model){
    window.xx = model;
    model.node.setScale(0.002);
    stage.addChild(model.node);
});

var meshPickerHelper = new Hilo3d.MeshPicker({
    renderer: stage.renderer
});

var selectedMesh;
stage.container.addEventListener('click', function(evt) {
    const mesh = meshPickerHelper.getSelection(evt.clientX, evt.clientY)[0];
    selectedMesh = mesh || selectedMesh;
});

var transparentMaterial = new Hilo3d.Material;
transparentMaterial.transparent = true;

postProcess.init(renderer);
var edgePass = postProcess.addKernelPass(postProcess.kernels.edgeDetect6, 'edgeDetect6');

renderer.on('afterRender', () => {
    if(selectedMesh){
        //render transparent mesh
        postProcess.frontBuffer.bind();
        renderer.clear(new Hilo3d.Color(0, 0, 0, 0));
        renderer.forceMaterial = new Hilo3d.BasicMaterial({
            diffuse:new Hilo3d.Color(1, 1, 1),
            lightType:'NONE'
        });
        renderer.renderMesh(selectedMesh);
        renderer.forceMaterial = null;
        
        // render edge
        postProcess.backBuffer.bind();
        renderer.setupBlend(transparentMaterial);
        postProcess.draw(postProcess.frontBuffer.texture, edgePass);
        
        // render screen
        renderer.state.bindSystemFramebuffer();
        renderer.setupBlend(transparentMaterial);
        postProcess.backBuffer.render(0, 0, 1, 1);
    }
});