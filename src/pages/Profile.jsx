import {getAuth, updateProfile} from 'firebase/auth'
import {doc, updateDoc, collection, getDocs, where, orderBy, query, deleteDoc} from 'firebase/firestore'
import { db } from '../firebase.config'
import {useState, useEffect} from 'react'
import {useNavigate, Link   } from 'react-router-dom'
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import ListingItem from '../components/ListingItem'

function Profile() {
    const auth = getAuth()
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [changeDetails, setChangeDetails] = useState(false)
    const [formData, setFormData]= useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })

    const {name, email} = formData
    
    const navigate = useNavigate()

    useEffect(()=>{

        const fetchUserListings = async ()=>{
            const listingsRef = collection(db, 'listings')

            const q = query(listingsRef, where('userRef', '==', auth.currentUser.uid), 
            orderBy('timestamp', 'desc'))

            const querySnap = await getDocs(q)
            const listings = []
            querySnap.forEach((listing)=>{
                return listings.push({
                    id: listing.id,
                    data: listing.data()
                })
            })
            setListings(listings)
            setLoading(false)
        }

        fetchUserListings()
    },[auth.currentUser.uid])
    
    const onLogout = ()=>{
        auth.signOut()
        navigate('/')
    }

    const onChange = (e)=>{
        setFormData((prevstate)=>({
            ...prevstate,
            [e.target.id]: e.target.value
        }))
    }

    const onSubmit = async ()=>{
        try{
            if(auth.currentUser.displayName !== name){
                // updateCurrentUser in fb
                await updateProfile(auth.currentUser, {
                    displayName: name
                })

                // update user in firestore
                const userRef = doc(db, 'users', auth.currentUser.uid)
                await updateDoc(userRef, {
                   name 
                })

            }

        }catch(error){
            toast.error('could not update')
        }
    }

    const onDelete = async(id)=>{
        if (window.confirm("Are you sure, You want to delete?")){
            await deleteDoc(doc(db, 'listings', id))
            const updatedListings = listings.filter(listing=>listing.id !== id)
            setListings(updatedListings)
            toast.success('deleted document successfully!')
        }
    }

    const onEdit = (listingId)=>navigate(`/edit-listing/${listingId}`)
    

    return (
        <div className='profile'>
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type='button' className='logOut' onClick={onLogout}>Logout</button>
            </header>
            <main>
                <div className="profileDetailsHeader">
                    <p className="profileDetailsText">Personal Details</p>
                    <p className='changeProfileDetails' onClick={()=>{
                        changeDetails && onSubmit()
                        setChangeDetails((prevState)=>!prevState)
                    }}>
                        {changeDetails ? 'done': 'change'}
                    </p>
                </div>
                <div className="profileCard">
                    <form>
                <input type="text" id='name' className={!changeDetails ? 'profileName' : 'profileNameActive'} 
                disabled={!changeDetails} value={name} onChange={onChange}/>

                <input type="text" id='email' className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} 
                disabled={true} value={email} onChange={onChange}/>
                    </form>
                </div>
                <Link to='/create-listing' className='createListing'>
                    <img src={homeIcon} alt="home" />
                    <p>Sell or rent your home</p>
                    <img src={arrowRight} alt="arrow right" />
                </Link>

                {!loading && listings?.length > 0 && (
                    <>
                        <p className="listingsText">Your Listings</p>
                        <ul className='listingsList'>
                            {
                                listings.map(({data, id})=>{
                                    return <ListingItem key={id} listing={data} id={id} 
                                    onDelete={()=>{onDelete(id)}} 
                                    onEdit={()=>{onEdit(id)}}/>
                                })
                            }
                        </ul>
                    </>
                ) }
            </main>
        </div>
    )
}

export default Profile
