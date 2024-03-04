import './Input.css';

function InputLg({type, text, name, placeholder, handleOnChange, value}){
    return (
        <div className="form_control_lg">
            <label htmlFor={name}>{text}:</label>
            <input 
                type={type}
                name={name} 
                id={name}   
                placeholder={placeholder}
                onChange={handleOnChange}
                value={value} 
                
            />
        </div>
    );
}

export default InputLg;