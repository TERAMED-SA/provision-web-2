import './Input.css';

function Textarea({type, text, name, placeholder, value, handleOnChange}){
    return (
        <div className="form_control">
            <label htmlFor={name}>{text}:</label>
            <textarea  
               type={type}
                name={name} 
                id={name}
                placeholder={placeholder} 
                onChange={handleOnChange}
            >
                {value}
            </textarea>
        </div>
    );
}

export default Textarea;