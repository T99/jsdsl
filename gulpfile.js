/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 8:48 PM -- June 16th, 2019.
 * Project: <name>
 * 
 * <name> - <desc>
 * Copyright (C) 2022 Trevor Sears
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import fs from "fs/promises";
import path from "path";
import gulp from "gulp";
import typescript from "gulp-typescript";
import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import { deleteAsync } from "del";

const paths = {
	
	typescript: {
		
		dir: "ts/",
		allFiles: "ts/**/*.ts",
		tsconfig: "ts/tsconfig.json"
		
	},
	
	javascript: {
		
		dir: "js/",
		allFiles: "js/**/*.js",
		entryPoint: "js/main.js",
		entryPointFileName: "main.js"
		
	},
	
	typedefs: {
		
		dir: ".d.ts/",
		allFiles: ".d.ts/**/*.d.ts"
		
	}
	
};

let typescriptProject = typescript.createProject(paths.typescript.tsconfig);

// The default Gulp task.
gulp.task("default", defaultTask);

// Cleans (deletes) all generated/compiled files.
gulp.task("clean", clean);

// Builds the entire project.
gulp.task("build", build);

// Cleans and builds the entire project.
gulp.task("rebuild", rebuild);

gulp.task("transferStyles", transferStyles);

// Watch for changes to relevant files and compile-on-change.
gulp.task("watch", watch);

function defaultTask(done) {
	
	return rebuild(done);
	
}

function clean(done) {
	
	return deleteAsync([
		paths.javascript.dir,
		paths.typedefs.dir
	]);
	
}

function build(done) {
	
	return gulp.series(
		buildJavaScriptPipeline,
		transferStyles
	)(done);
	
}

function rebuild(done) {
	
	gulp.series(clean, build)(done);
	
}

function buildJavaScriptPipeline(done) {
	
	return gulp.series(
		compileTypeScript,
		uglifyJavaScript
	)(done);
	
}

function compileTypeScript(done) {
	
	let proj =
		typescriptProject.src()
			.pipe(sourcemaps.init())
			.pipe(typescriptProject());
	
	let compileJS = (done) => {
		
		return proj.js
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest(paths.javascript.dir));
		
	};
	
	let compileDTS = (done) => {
		
		return proj.dts
			.pipe(gulp.dest(paths.typedefs.dir));
		
	};
	
	return gulp.parallel(compileJS, compileDTS)(done);
	
}

function uglifyJavaScript(done) {
	
	return gulp.src(paths.javascript.allFiles)
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(terser())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(paths.javascript.dir));
	
}

function transferStyles(done) {
	
	const scanDir = async (dir) => {
		
		for (const file of await fs.readdir(dir)) {
			
			const filePath = path.join(dir, file);
			
			let pathComponents = filePath.split(".");
			
			if (pathComponents[pathComponents.length - 1] === "scss") {
				
				let mappedDirectory = dir.split("/");
				mappedDirectory[0] = "js";
				
				await fs.mkdir(
					path.join(...mappedDirectory),
					{ recursive: true }
				);
				
				await fs.copyFile(
					filePath,
					path.join(...mappedDirectory, file)
				);
				
			}
			
			let stats = await fs.stat(filePath);
			
			if (stats.isDirectory()) await scanDir(filePath);
			
		}
		
	};
	
	scanDir(paths.typescript.dir).then(done);
	
}

function watch(done) {
	
	gulp.watch([paths.typescript.allFiles], buildJavaScriptPipeline);
	
}
