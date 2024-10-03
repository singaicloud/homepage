class TACCTheme {
    constructor() {
        this.name = 'TACC Theme';
        this.version = '0.1';
        this.DataTable = null;
    }

    render_table(data, header_render, row_render, target, columnDefs=[]) {
        var rows = [];
        if (!Array.isArray(data)) { 
            data = [data];
        }
        data.forEach((row)=>{
            var rendered_row = row_render(row);
            // check if it is a row or a row array
            if (Array.isArray(rendered_row)) {
                rendered_row.forEach((r)=>{
                    rows.push(r);
                });
            } else {
                rows.push(rendered_row);
            }
        }); 
        let render = $.create('table', {
            contents: [
                header_render(data),
                {tag: 'tbody', contents: rows}
            ]
        });
        $(target)._.contents(render);
        var enableDataTable = true;
        if (enableDataTable) {
            if (this.DataTable) { this.DataTable.destroy(true); }
            this.DataTable = new DataTable(`${target} table`,{
                layout: {
                    topStart: {search: {
                        text: "_INPUT_",
                        placeholder: "Searching all entries",
                    }},
                    topEnd: {paging: {type: "simple_numbers"}},
                    bottomStart: null,
                    bottomEnd: {
                        info: {}, 
                        pageLength: {menu: [5, 10, 15, 20], text: '(_MENU_ entries per page)'},
                    }
                },
                columnDefs: columnDefs,
            });
            $.create("div", {
                className: "control has-icons-left",
                around: $("input[type='search']"), 
                contents:{ 
                    tag: "span", 
                    className: "icon is-left", 
                    contents: {tag: "i", className: "fas fa-search"}
                },
            });
            $$(".dt-container > .is-multiline").forEach((e)=>e.classList.add("is-mobile"));
            $$(".dt-container > .is-multiline").forEach((e)=>e.classList.add("is-gapless"));
        }
        return render;
    }

    extract_form(target) {
        var data = {};
        $$(target + ' input, select').forEach(function(input){
            // use switch based on type
            switch($(input).getAttribute('type')){
                case 'checkbox':
                    data[$(input).getAttribute('name')] = $(input).checked;
                    break;
                default:
                    data[$(input).getAttribute('name')] = $(input).value;
            }
        });
        return data;
    }
}

const tacc = new TACCTheme();