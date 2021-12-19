import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import {toast} from 'react-toastify'
import OAuth from '../components/OAuth'

function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const {email, password} = formData

    const navigate = useNavigate()

    const onChange = (e)=>{
        setFormData((prevState)=>{
            return {
                ...prevState,
                [e.target.id]:e.target.value
            }
        })
    }

    const onSubmit = async (e)=>{
        e.preventDefault()

        try{
            const auth = getAuth()
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            

            if(userCredential.user){
                // const userRef = doc(db, 'users', user.uid)
                // const userSnap =await getDoc(userRef)
                // if(userSnap){
                //     console.log(userSnap.data())
                // }else{
                //     console.log('no user')
                // }
                navigate('/')
            }


        } catch(error){
            // const errorCode = error.code
            // const errorMessage = error.message
            toast.error('Bad user credentials!')
        }

    }

    return (
        <>
         <div className="pageContainer">
             <header>
                 <p className="pageHeader">
                     Welcome Back!
                 </p>
             </header>
             <form onSubmit={onSubmit}>
                 <input type="text" placeholder='Email' 
                 id='email' className='emailInput' value={email} onChange={onChange}/>

                 <div className="passwordInputDiv">
                     <input type={showPassword ? 'text':'password'} className='passwordInput' 
                     id='password' value={password} onChange={onChange}/>
                     <img src={visibilityIcon} alt="show password" className='showPassword' 
                     onClick={()=>setShowPassword((prevState)=>!prevState)}/>
                 </div>
                 <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password</Link>
                <div className="signInBar">
                    <p className="signInText">Sign In</p>
                    <button className='signInButton'>
                    <ArrowRightIcon width={'36px'} height={'36px'} fill='#ffffff'/>
                    </button>
                </div>
             </form>

             <OAuth/>
             <Link to='/sign-up' className="registerLink">Sign Up Instead</Link>
             </div>

        </>
    )
}

export default SignIn
