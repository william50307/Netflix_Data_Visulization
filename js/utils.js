function get_all_countrys(data){

	let countrys_all = [];
	for(const d of data){
		for(const c of d.country.split(', ')){
			if (!countrys_all.includes(c) && c){
				countrys_all.push(c);
			}
		}
	}

	countrys_all = countrys_all.map(function(c){
		let amount = 0
		data.map( function(d){
			if (d.country.split(', ').includes(c)){
				amount += 1;
			}
		})
		return {'country' : c , 'amount' : amount}
	})

	countrys_all.sort((a, b) => b.amount - a.amount)
	return countrys_all;
}

function get_all_genres(data){

	let genres_all = [];
	for (const d of data){
		for(const g of d.listed_in.split(', ')){
		if (!genres_all.includes(g) && g){
			genres_all.push(g);
		}
	}
	}
	
	return genres_all.sort()
}