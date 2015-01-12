
$(document).ready(function(){              
    // select
    $('.selectpicker').selectpicker();
    $('select.selectpicker').on('change', function(){
        var selected = $('.selectpicker option:selected').attr('value');
        makeBoard(1, selected, "");
    });

    // board
    makeBoard(1, "all", "");

    // board write button
    $('#btnWrite').click(function(){
        var form = document.getElementById("boardWrite");

        form.method = "POST";
        form.action = "/create";
        form.submit();
    });

    // lightbox
    $('i.glyphicon-thumbs-up, i.glyphicon-thumbs-down').click(function(){    
        var $this = $(this),
        c = $this.data('count');    
        if (!c) c = 0;
        c++;
        $this.data('count',c);
        $('#'+this.id+'-bs3').html(c);
    });      
    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });                                        

}); 

function makeBoard(pageNum, category, keyword){
    var url = "/read/" + pageNum + "/cat/" + category;

    $('#board').load(url, function(){
        $('a[href="#infoModal"]').click(function(){
            var id = $(this).attr('value');
            $('#infoModal').load("/read/detail/"+id);
        });
    });
}


/* 
 *   Selects 
 */

$(function(){
	var values = new Array();
	
	$(document).on('change', '.form-group-multiple-selects .input-group-multiple-select:last-child select', function(){
		var selectsLength = $('.form-group-multiple-selects .input-group-multiple-select select').length;
		var optionsLength = ($(this).find('option').length)-1;
		
		if(selectsLength < optionsLength){
			var sInputGroupHtml = $(this).parent().html();
			var sInputGroupClasses = $(this).parent().attr('class');
			$(this).parent().parent().append('<div class="'+sInputGroupClasses+'">'+sInputGroupHtml+'</div>');	
		}
		updateValues();
	});
	
	$(document).on('change', '.form-group-multiple-selects .input-group-multiple-select:not(:last-child) select', function(){
		updateValues();
	});
	
	$(document).on('click', '.input-group-addon-remove', function(){
		$(this).parent().remove();
		updateValues();
	});
	
	function updateValues()
	{
		values = new Array();
		$('.form-group-multiple-selects .input-group-multiple-select select').each(function(){
			var value = $(this).val();
			if(value != 0 && value != ""){
				values.push(value);
			}
		});
		
		$('.form-group-multiple-selects .input-group-multiple-select select').find('option').each(function(){
			var optionValue = $(this).val();
			var selectValue = $(this).parent().val();
			if(in_array(optionValue,values)!= -1 && selectValue != optionValue)
			{
				$(this).attr('disabled', 'disabled');
			}
			else
			{
				$(this).removeAttr('disabled');
			}
		});
	}
	
	function in_array(needle, haystack){
		var found = 0;
		for (var i=0, length=haystack.length;i<length;i++) {
			if (haystack[i] == needle) return i;
			found++;
	    }
	    return -1;
	}
});


/* 
 * Radio Button
 */

$('#radioBtn a').on('click', function(){
    var sel = $(this).data('title');
    var tog = $(this).data('toggle');
    $('#'+tog).prop('value', sel);
    
    $('a[data-toggle="'+tog+'"]').not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
    $('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
})


