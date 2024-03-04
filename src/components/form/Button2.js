import './IconButton.css';

function Button2({type, text, handleOnChange, handleOnClick}){
    return (
        <div className='button2'>
            <button 
                type={type}
                
                onChange={handleOnChange}
                onClick={handleOnClick}
                
            >
                {text}
            </button>
        </div>
    );
}

export default Button2;