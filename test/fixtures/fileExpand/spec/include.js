describe('fileExpand', function() {
  
  it('should exclude src files', function() {
    expect(include).toEqual(true);
    expect(typeof exclude).toEqual('undefined');
  });

});
