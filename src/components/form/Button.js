import './IconButton.css';

function Button({type, text, handleOnChange, handleOnClick}){
    return (
        <div>
            <button 
                type={type}
                className='button'
                onChange={handleOnChange}
                onClick={handleOnClick}
                
            >
                {text}
            </button>
        </div>
    );
}

export default Button;