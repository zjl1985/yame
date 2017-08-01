import { FileContent } from '../../../common/content/file';
import { DirectoryContent } from '../../../common/content/directory';
import { Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as path from 'path';
import * as _ from 'lodash';
import * as Promise from 'bluebird';

/**
 * The workspace service is holding a json representation of the workspace files.
 *
 * This service provides a public api for accessing file and directory representations for file system paths.
 *
 * @export
 * @class WorkspaceService
 * @todo Implement watch task on the directory
 */
@Injectable()
export class WorkspaceService {

  private internalFiles: DirectoryContent;
  private internalFolders: DirectoryContent[];
  private internalState: 'init' | 'ready' | 'fail' = 'init';
  private internalError;

  private initSource = new Subject<void>();
  private readySource = new Subject<void>();
  private failSource = new Subject<void>();

  init$ = this.initSource.asObservable();
  ready$ = this.readySource.asObservable();
  fail$ = this.failSource.asObservable();

  /**
   * Initializes the given directory as the workspace directory.
   * The loaded json representation gets resolved on success.
   *
   * @param {string} rootDir The full path of the workspace.
   * @returns {Promise}
   */
  init(rootDir: string): Promise<DirectoryContent> {
    if (this.internalState !== 'init')
      return Promise.resolve(this.internalFiles);
    this.internalState = 'init';
    this.initSource.next();
    return new Promise<DirectoryContent>((resolve, reject) => {
      let id = _.uniqueId('workspace-service-');
      ipcRenderer.send('directory:scan', rootDir, id, true);
      ipcRenderer.once(`directory:scan:${id}:done`, (event, json) => {
        ipcRenderer.removeAllListeners(`directory:scan:${id}:fail`);
        this.internalFiles = json;
        this.internalFolders = this.getDirectories(this.internalFiles);
        this.internalState = 'ready';
        this.readySource.next();
        resolve(this.internalFiles);
      });
      ipcRenderer.once(`directory:scan:${id}:fail`, (event, e) => {
        ipcRenderer.removeAllListeners(`directory:scan:${id}:done`);
        this.internalState = 'fail';
        this.internalError = e;
        this.failSource.next();
        reject(e);
      });
    });
  }

  /**
   * Scans recursively all directories for the given path and returns the found directory or file object.
   *
   * @param {string} path
   * @returns {(DirectoryContent | FileContent)} The found directory or file.
   */
  find(path: string): DirectoryContent | FileContent {
    if (path == this.internalFiles.path)
      return this.internalFiles;
    let found: DirectoryContent | FileContent = null;
    let searchChildren = (children: (DirectoryContent | FileContent)[]) => {
      let f = null;
      children.some(child => {
        if (child.path == path)
          f = child;
        else if ((<DirectoryContent>child).children !== void 0)
          f = searchChildren((<DirectoryContent>child).children);
        return f !== null;
      });
      return f;
    };
    return searchChildren(this.internalFiles.children);
  }

  /**
   * @param {DirectoryContent} directory
   * @returns {DirectoryContent[]} Filtered list of the given directory structure with directories only.
   */
  getDirectories(directory: DirectoryContent): DirectoryContent[] {
    let getDirectories = (children: (DirectoryContent | FileContent)[]) => {
      let folders = children.filter(child => (<DirectoryContent>child).children !== void 0);
      folders = <DirectoryContent[]>folders.map(folder=> _.extend({ }, folder));
      folders.forEach(folder =>(<DirectoryContent>folder).children = getDirectories( (<DirectoryContent>folder).children ));
      return <DirectoryContent[]>folders;
    };
    return getDirectories(directory.children);
  }

  /**
   * Returns a list of all files (direct childs) in the given directory path.
   *
   * @param {string | DirectoryContent} path Should be a directory path.
   * @returns {(DirectoryContent | FileContent)[]} `null` will be returned if the path is not a directory.
   */
  getFiles(path: string | DirectoryContent): (DirectoryContent | FileContent)[] {
    let found: DirectoryContent | FileContent = this.find(typeof path === 'string' ? path : path.path);
    if (found && (<DirectoryContent>found).children !== void 0)
      return (<DirectoryContent>found).children;
    else
      return null;
  }

  /**
   * Returns the parent object for the given file.
   *
   * @param {(string | DirectoryContent | FileContent)} file
   * @returns {DirectoryContent} `null` may be returned if the parent is not part of the workspace.
   */
  getParent(file: string | DirectoryContent | FileContent): DirectoryContent {
    let filePath = typeof file === 'string' ? file : file.path;
    let re = <DirectoryContent>this.find( path.dirname(filePath));
    return re;
  }

  /**
   * Returns all parents of the given file by climbing the hierarchy up.
   *
   * @param {(string | DirectoryContent | FileContent)} file
   * @returns {DirectoryContent[]} A list of all parents of the given file.
   */
  getParents(file: string | DirectoryContent | FileContent): DirectoryContent[] {
    let parents = [];
    let parent = file;
    while (parent = this.getParent(parent))
      parents.push(parent);
    return parents;
  }

  /**
   * @readonly
   * @type {DirectoryContent[]} folders A filtered version of WorkspaceService#files, which contains only directories.
   */
  get directories(): DirectoryContent[] {
    if (!this.internalFolders)
      throw 'Workspace not initialized yet!';

    return this.internalFolders;
  }

  /**
   * @readonly
   * @type {string} state The current scanning state
   */
  get state(): string {
    return this.internalState;
  }

  /**
   * @readonly
   * @type {DirectoryContent} directory The json representation of the workspace root folder.
   */
  get directory(): DirectoryContent {
    return this.internalFiles;
  }

  /**
   * @readonly
   * @type {((DirectoryContent | FileContent)[])} files The list of files and directories at the workspace root.
   */
  get files(): (DirectoryContent | FileContent)[] {
    return this.internalFiles.children;
  }

  get error() {
    return this.internalError;
  }
}