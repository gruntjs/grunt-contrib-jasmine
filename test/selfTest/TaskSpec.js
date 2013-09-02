describe("Task", function() {
	
	/*
	when running this test with `grunt jasmine:selfTest -d` you got this output
	
	[D] ["phantomjs","onLoadFinished","success"]
	[D] ["phantomjs","onResourceRequested","http://httpbin.org/status/500"]
	[D] ["phantomjs","onResourceReceived","http://httpbin.org/status/500"]
	[D] ["phantomjs","onLoadFinished","fail"]
	[D] ["phantomjs","fail.load","_SpecRunner.html"]
	
	phantomjs.page.onLoadFinished seems to be called for iframes, too.
	A failing onLoadFinished caused this grunt taks to hang.
	Now, after removing the event handler, this following test should work as expected
	*/
	it("can handle fail on iframe", function(){
		var waitedLongEnough;
        runs(function(){
            iframe = document.createElement("iframe");
            iframe.src = "http://localhost:9000";
            document.body.appendChild(iframe);

			setTimeout(function(){waitedLongEnough=true;}, 50);
        });
        waitsFor(function(){
            return waitedLongEnough;
        });
        runs(function(){
			expect(true).toBeTruthy("without change in grunt-lib-phantomjs, jasmine would never reach this line");
        });
	});
});