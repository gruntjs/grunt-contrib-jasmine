describe("external vendor test", function() {

  it("should have pulled in jQuery", function() {
    expect($.fn.jquery).toBeTruthy();
  });

});
