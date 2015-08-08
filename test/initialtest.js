test('Test pixels from drawn control', function(assert) {
     var context, canvas = document.getElementById("maincanvas");
     try {
         context = canvas.getContext("2d");
     } catch (e) { return; }
     // assert.expect(1);
     assert.pixelEqual(canvas, 15, 15, 255, 255, 255, "Found Control Drawn");     
});
