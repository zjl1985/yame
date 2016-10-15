import { View } from './../../../../core/view/abstract';
import { Image } from './../../../../core/view/image';
import { Resource } from '../../resource';
import { PropertiesView } from './resource/properties';
import {Sprite} from '../../../../core/graphics/sprite';
import {Payload} from '../../../../core/file/drop/payload';

import * as path from 'path';
import * as Promise from 'bluebird';

/**
 * Represents a sprite resource.
 * Use the SpriteResource#filePath and and SpriteResource#texture properties to
 * access the actual PIXI texture and its path.
 */
export class SpriteResource extends Resource {

    private _texture: PIXI.Texture;
    private _filePath: string;
    private _propertiesView: PropertiesView;

    constructor(filePath: string) {
        super();
        this._filePath = filePath;
        this._texture = PIXI.Texture.fromImage(filePath);
        this._propertiesView = new PropertiesView();
        this._propertiesView.on('opened', (file: string) => {
            this._texture = PIXI.Texture.fromImage(file);
            this._filePath = file;
            this._propertiesView.image.src = this._filePath;
            this.trigger('change');
        });
    }

    /** @inheritdoc */
    get type(): string {
        return 'Sprite';
    }

    /** @inheritdoc */
    get displayName(): string {
        return path.basename(this._filePath);
    }

    /** @inheritdoc */
    get image(): Image {
        let img = new Image();
        img.src = this._filePath;
        return img;
    }

    /** @inheritdoc */
    get properties(): View {
        this._propertiesView.image.src = this._filePath;
        return this._propertiesView;
    }

    /** @returns {string} The file path of this sprite resource. */
    get filePath(): string {
        return this._filePath;
    }

    /** @returns {PIXI.Texture} The texture for this sprite resource. */
    get texture(): PIXI.Texture {
        return this._texture;
    }

    /** @inheritdoc */
    public create(): Promise<Sprite> {
        return new Promise<Sprite>((resolve, reject) => {
            let sprite = new Sprite(this.filePath);
            sprite.texture.crop = new PIXI.Rectangle(0.5, 0.5, 1, 1);
            if (sprite.ready)
                resolve(sprite);
            else
                sprite.once('ready', () => resolve(sprite));
        });
    }
}