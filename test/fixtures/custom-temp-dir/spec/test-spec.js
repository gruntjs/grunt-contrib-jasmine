describe("custom temp directory test", function() {

  it("should have loaded from a custom temp directory", function() {
    expect(working).toBeTruthy();

    var links = document.getElementsByTagName('link');
    expect(links[0].href).toEqual(jasmine.stringMatching('.custom/jasmine_favicon.png'));
    expect(links[1].href).toEqual(jasmine.stringMatching('.custom/jasmine.css'));

    var scripts = document.getElementsByTagName('script');
    expect(scripts[0].src).toEqual(jasmine.stringMatching('.custom/jasmine.js'));
    expect(scripts[1].src).toEqual(jasmine.stringMatching('.custom/jasmine-html.js'));
    expect(scripts[2].src).toEqual(jasmine.stringMatching('.custom/json2.js'));
    expect(scripts[3].src).toEqual(jasmine.stringMatching('.custom/boot.js'));
    expect(scripts[4].src).toEqual(jasmine.stringMatching('test/fixtures/custom-temp-dir/src/test.js'));
    expect(scripts[5].src).toEqual(jasmine.stringMatching('test/fixtures/custom-temp-dir/spec/test-spec.js'));
    expect(scripts[6].src).toEqual(jasmine.stringMatching('.custom/reporter.js'));
  });

});
