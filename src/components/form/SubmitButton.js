import './Input.css';

function SubmitButton({type, text}){
    return (
        <div>
            <button 
                type={type}
                className='button'
            >
                {text}
            </button>
        </div>
    );
}

export default SubmitButton;