describe("Polyfills", function() {

  describe("Function.prototype.bind", function(){
    it("should allow contexts to be bound to a function", function() {
      var fn = bindTest.bind({foo : 'bar'});
      expect(fn()).toBe('bar');
    });

  });
});
