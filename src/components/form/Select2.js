import './Input.css';

function Select2({text, name, options, handleOnChange, value}){
    return(
        <div className="form_control">
            <label htmlFor={name}>{text}:</label>
            <select name={name} id={name} onChange={handleOnChange} value={value || ''}>
                <option>Seleciona uma opção</option>
                
                
            </select>
        </div>
    )
}

export default Select2;