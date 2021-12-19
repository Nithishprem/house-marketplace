import {useState, useEffect, useRef} from 'react'
import {getAuth, onAuthStateChanged} from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {db} from '../firebase.config'
import {getDoc,doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import {useNavigate, useParams} from 'react-router-dom'
import {toast} from 'react-toastify'
import {v4 as uuidv4} from 'uuid'
import Spinner from '../components/Spinner'


function EditListing() {
    //eslint-disable-next-line
    const [geolocationEnabled, setGeolocaionEnabled] = useState(false)
    const [listing, setListing] = useState(null)
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0 
    })
    
    const {type, name, bedrooms,bathrooms, parking,furnished, address, 
        offer, regularPrice, discountedPrice, images, latitude, longitude} = formData
        const [loading, setLoading] = useState(false)
        const auth =getAuth()
        const navigate = useNavigate()
        const params = useParams()
        const isMounted = useRef(true)

        // Redirect if listing is not user
        useEffect(()=>{
            if(listing && listing.userRef !== auth.currentUser.uid){
                toast.error('You cannot edit this listing')
                navigate('/')
            }
        },[auth.currentUser.uid,navigate,listing])

        //Fetch listing to edt
        useEffect(()=>{
            setLoading(true)
            const fetchListing = async()=>{
                const docRef = doc(db, 'listings', params.listingId)
                const docSnap = await getDoc(docRef)

                if(docSnap.exists()){
                    setListing(docSnap.data())
                    setFormData({...docSnap.data(), address: docSnap.data().location})
                }else{
                    navigate('/')
                    toast.error('listing does not exist')
                }
                setLoading(false)
            }
            fetchListing()
        },[params.listingId,navigate])
        

        //sets userRef to current user
        useEffect(()=>{
        if(isMounted){
            onAuthStateChanged(auth, (user)=>{
                if(user){
                    setFormData({...formData, userRef: user.uid})
                } else{
                    navigate('/sign-in')
                }
            })
        }
        return ()=>{
            isMounted.current = false
        }
    },[isMounted])

    const onSubmit = async(e)=>{
        e.preventDefault()
        setLoading(true)
        
        if(discountedPrice >= regularPrice){ 
            setLoading(false)
            toast.error('Disconted Price should be less than regular Price')
            return
        }
        if(images.lenth> 6){
            setLoading(false)
            toast.error('Max 6 images')
            return
        }
        
        let geolocation = {} 
        let location

        if(geolocationEnabled){
            const response = await fetch (
                `https://maps.googleapis.com/maps/api/geocode/json?
                address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
            )

            const data = await response.json()
            
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

            location = data.status === 'ZERO_RESULTS' ? undefined:data.results[0]?.formatted_address
            if(location === undefined || location.includes('undefined')){
                setLoading(false)
                toast.error('Please enter a correct address')
                return
            }

        }else{
            geolocation.lat = latitude
            geolocation.lng = longitude
            
            // console.log(formData)
        }

        //store images in firebase
        const storeImage = async (image) => {
            return new Promise((resolve, reject)=>{

                const storage = getStorage()
                const  fileName = `${auth.currentUser.uid}-${image.name}-${
                    uuidv4()
                }`
                const storageRef = ref(storage, 'images/'+fileName)

                const uploadTask = uploadBytesResumable(storageRef, image);
                
                uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    default:
                        break
                    }
                }, 
                (error) => {
                    reject(error)
                }, 
                () => {

                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
                );

            })
        }

        const imageUrls = await Promise.all(
            [...images].map((image)=>storeImage(image))
        ).catch(()=>{
            setLoading(false)
            toast.error('Images not uploaded')
            return
        })

        const formDataCopy ={
            ...formData,
            imageUrls,
            geolocation,
            timestamp: serverTimestamp()
        }

        formDataCopy.location = address
        delete formDataCopy.images
        delete formDataCopy.address
        !formDataCopy.offer && delete formDataCopy.discountedPrice
        
        
        //update listing
        const docRef = doc(db, 'listings', params.listingId)
        await updateDoc(docRef, formDataCopy)
        setLoading(false)
        toast.success('Listing saved sucessfully!!')
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)

    }

    const onMutate = (e)=>{
        let boolean = null
        if(e.target.value ==='true'){
            boolean = true
        }
        if(e.target.value ==='false'){
            boolean = false
        }

        //files
        if(e.target.files){
            setFormData((preState)=>({
                ...preState,
                images: e.target.files
            }))
        }//numbers
        else if(e.target.type === 'number'){
            setFormData((preState)=>({
                ...preState,
                [e.target.id]: Number(e.target.value)
            }))
        }

        //text/boolean
        else{
            setFormData((preState)=>({
                ...preState,
                [e.target.id]: boolean ?? e.target.value
            }))
        }  
         
    }

    if(loading) return <Spinner/>
    
    return (
        <div className='profile'>
            <header><p className='pageHeader'>Edit Listing</p></header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className='formLabel'>Sell / Rent</label>
                    <div className="formButtons">
                        <button type='button'
                                id='type'
                                value='sale'
                                className={type === 'sale'?'formButtonActive':'formButton'}
                                onClick={onMutate}>
                                    Sell
                        </button>
                        <button type='button'
                                id='type'
                                value='rent'
                                className={type === 'rent'?'formButtonActive':'formButton'}
                                onClick={onMutate}>
                                    Rent
                        </button>
                    </div>
                    <label className='formLabel'>Name</label>
                    <input type="text"
                    className='formInputName'
                    id='name'
                    value={name}
                    onChange={onMutate}
                    maxLength='32'
                    minLength='10'
                    required />
                    
                    <div className="formRooms flex">
                        <div>
                            <label className='formLabel'>Bedrooms</label>
                                <input type="number"
                                className='formInputSmall'
                                id='bedrooms'
                                value= {bedrooms}
                                onChange={onMutate}
                                maxLength= '1'
                                minLength='50'
                                required />
                        </div>
                        <div>
                            <label className='formLabel'>Bathrooms</label>
                                <input type={'number'}
                                className='formInputSmall'
                                id='bathrooms'
                                value={bathrooms}
                                onChange={onMutate}
                                maxLength= '1'
                                minLength='50'
                                required />
                        </div>
                    </div>
                    <label className='formLabel'>Parking Spot</label>
                    <div className="formButtons">
                        <button type='button'
                                id='parking'
                                value= {true}
                                className={parking === true?'formButtonActive':'formButton'}
                                onClick={onMutate}>
                                    Yes
                        </button>
                        <button type='button'
                                id='parking'
                                value={false}
                                className={parking === false?'formButtonActive':'formButton'}
                                onClick={onMutate}>
                                    No
                        </button>
                    </div>

                    <label className='formLabel'>Furnished</label>
                    <div className="formButtons">
                        <button type='button'
                                id='furnished'
                                value= {true}
                                className={furnished === true?'formButtonActive':'formButton'}
                                onClick={onMutate}>
                                    Yes
                        </button>
                        <button type='button'
                                id='furnished'
                                value={false}
                                className={furnished === false?'formButtonActive':'formButton'}
                                onClick={onMutate}>
                                    No
                        </button>
                    </div>

                    <label className='fomLabel'>Address</label>
                    <textarea 
                    className='formInputAddress'
                    type="text"
                    id="address"
                    value={address}
                    onChange={onMutate}
                    required/>

                    {!geolocationEnabled &&(
                        <div className="formLatLng flex">
                            <div>
                                <label className="formLabel">Latitude</label>
                                <input type="number"
                                className='formInputSmall' 
                                id='latitude'
                                value={latitude}
                                onChange={onMutate}
                                required/>
                            </div>
                            <div>
                                <label className="formLabel">Longitude</label>
                                <input type="number"
                                className='formInputSmall' 
                                id='longitude'
                                value={longitude}
                                onChange={onMutate}
                                required/>
                            </div>
                        </div>
                    )}

                    <label className='formLabel'>Offer</label>
                        <div className="formButtons">
                            <button type='button'
                                    id='offer'
                                    value= {true}
                                    className={offer ?'formButtonActive':'formButton'}
                                    onClick={onMutate}>
                                        Yes
                            </button>
                            <button type='button'
                                    id='offer'
                                    value={false}
                                    className={!offer && false !==null?'formButtonActive':'formButton'}
                                    onClick={onMutate}>
                                        No
                            </button>
                        </div>

                        <label className='formLabel'>Regular Price</label>
                        <div className="formPriceDiv">
                            <input className='formInputSmall' 
                            type="number"
                            id='regularPrice'
                            value={regularPrice}
                            onChange={onMutate}
                            min='50'
                            max="75000000"
                            required />
                            {formData.type === 'rent' && (
                                <p className='formPriceText'>$ / Month</p>
                            )}
                        </div>

                        {offer && (
                            <>
                                <label className='formLabel'>Discounted Price</label>
                                <div className="formPriceDiv">
                                    <input className='formInputSmall' 
                                    type="number"
                                    id='discountedPrice'
                                    value={discountedPrice}
                                    onChange={onMutate}
                                    min='50'
                                    max="75000000"
                                    required={offer} />
                                    {formData.type === 'rent' && (
                                        <p className='formPriceText'>$ / Month</p>
                                    )}
                                    </div>
                            </>
                        )}
                        <label className='formLabel'>Images</label>
                        <p className="imagesInfo">The first image will 
                        be the cover(max 6)</p>
                        <input 
                        className='formInputFile'
                        type="file"
                        id='images'
                        onChange={onMutate}
                        max={6}
                        accept='.jpg,.png,.jpeg'
                        multiple
                        required />
                        <button className='primaryButton createListingButton' type='submit'>
                            Edit Listing
                        </button>
                </form>
            </main>
            
        </div>
    )
}

export default EditListing
