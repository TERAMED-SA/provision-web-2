import './Input.css';

function Select3({text, name, options, handleOnChange, value}){
    return(
        <div className="form_control">
            <label htmlFor={name}>{text}:</label>
            <select name={name} id={name} onChange={handleOnChange} value={value || ''}>
                <option>Seleciona uma opção</option>
                <option>Luanda</option>
                <option>Benguela</option>
                <option>Malanje</option>
            </select>
        </div>
    )
}

export default Select3;