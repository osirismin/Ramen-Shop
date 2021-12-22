import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter
{
    constructor(sources)
    {
        super()

        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.video = {}
        this.videoTexture = {}

        this.setLoaders()
        this.startLoading()
    }

    setLoaders()
    {
        this.loaders = {}
        this.loaders.dracoLoader = new DRACOLoader
        this.loaders.dracoLoader.setDecoderPath('/draco/')
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    }

    startLoading()
    {
        // Load each source
        for(const source of this.sources)
        {
            if(source.type === 'gltfModel')
            {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'texture')
            {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) =>
                    {
                        file.flipY = false
                        // file.encoding = THREE.sRGBEncoding
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'cubeTexture')
            {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'videoTexture')
            {
                this.video[source.name] = document.createElement('video')
                this.video[source.name].playsInline = true
                this.video[source.name].muted = true
                this.video[source.name].loop = true
                // this.video.flip = false
                
                this.videoTexture[source.name] = new THREE.VideoTexture(this.video[source.name])
                // this.videoTexture.wrapS = THREE.RepeatWrapping;
                // this.videoTexture.repeat.x = - 1;
                
                this.video[source.name].addEventListener('loadeddata', () =>
                {
                    this.videoTexture.needsUpdate = true
                    this.video[source.name].play()
                    this.sourceLoaded(source, this.videoTexture[source.name])
                })
                this.video[source.name].src = source.path      


                
            }
        }
    }

    sourceLoaded(source, file)
    {
        this.trigger('itemLoaded')

        this.items[source.name] = file
        this.loaded++

        if(this.loaded === this.toLoad)
        {
            this.trigger('ready')
        }
    }
}