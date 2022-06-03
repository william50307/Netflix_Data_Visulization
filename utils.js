function get_all_countrys(data){

	let countrys_all = [];
	for(const d of data){
		for(const c of d.country.split(', ')){
			if (!countrys_all.includes(c) && c){
				countrys_all.push(c);
			}
		}
	}

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
	
	return genres_all
}