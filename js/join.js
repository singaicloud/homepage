jQuery(function(){
	jQuery(".cta").on("click", ()=>{
		jQuery(".cta").hide();
		jQuery(".waitlist-form").show();
		jQuery(".waitlist input").focus();
	});	
	jQuery(".waitlist input").on("keydown", (event)=>{
		if (event.which == 13) {
			jQuery(".join-btn").trigger("click");
		}
	});
	jQuery(".join-btn").on("click", ()=>{
		const email = jQuery(".waitlist input").val();
		jQuery.ajax({
			url: 'https://api.getwaitlist.com/api/v1/signup',
	        type: "POST",
	        contentType: 'application/json',
		    data: JSON.stringify({
		        email: email,
		        waitlist_id: 21188,
		        metadata: {},
		    }),
		    success: function(response) {
		        console.log('Success:', response);
		    },
	    })
		jQuery(".waitlist input").remove();
		const thankyou = jQuery(".waitlist .thankyou");
		thankyou.show();
		var typewriter = new Typewriter(thankyou.get(0), {delay: 50});
		typewriter.typeString('Thank you')
		    .pauseFor(1000)
		    .typeString(' and <u>stay tuned</u>.')
		    .start();
	});
});