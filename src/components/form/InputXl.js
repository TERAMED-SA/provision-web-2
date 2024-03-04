import './Input.css';

function InputXl({type, text, name, placeholder, handleOnChange, value}){
    return (
        <div className="form_control_xl">
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

export default InputXl;