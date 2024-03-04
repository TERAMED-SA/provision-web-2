import './Search.css';

function Search({text, name, placeholder, onChange, value}){
    return (
        <div className="form_search">
            <input  
                name={name} 
                id={name}
                placeholder={placeholder}
                onChange={onChange}
                value={value}
            />
        </div>
    );
}

export default Search;