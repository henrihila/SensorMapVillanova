function addContent() {
	$.ajax({url:"http://127.0.0.1:5000/getContent",success:function(result) { 
		var element = result;

		//window.alert(element);

		$(".content").replaceWith(element);

	}});
} 