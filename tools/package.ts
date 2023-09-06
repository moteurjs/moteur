import * as fs from "node:fs";
import * as path from "node:path";

const FILE_REGEX = /\.(d\.ts|js)$/i;
const SOURCE_MAP_REGEX = /\/\/\# sourceMappingURL\=.*$/gi;

function packageDist(packageName: string): string {
    return path.join("packages", packageName, "dist");
}

function createDist() {
    if (fs.existsSync("dist")) fs.rmSync("dist", { recursive: true });
}

function copyFiles() {
    const packages = fs.readdirSync("packages");
    const packageFiles = packages.map(
        (pkg) =>
            [
                pkg,
                (
                    fs.readdirSync(packageDist(pkg), {
                        recursive: true,
                    }) as string[]
                ).filter((node) => FILE_REGEX.test(node)),
            ] as const,
    );

    packageFiles.forEach(([pkg, files]) => {
        files.forEach((filePath) => {
            fs.mkdirSync(path.join("dist/lib", pkg, path.dirname(filePath)), {
                recursive: true,
            });

            const fileDepth = filePath.split("/").length;
            const relativeRoot = new Array(fileDepth).fill("..").join("/");

            const data = fs
                .readFileSync(path.join(packageDist(pkg), filePath))
                .toString("utf8")
                .replaceAll(SOURCE_MAP_REGEX, "")
                .replaceAll("@moteur", relativeRoot);

            fs.writeFileSync(path.join("dist/lib", pkg, filePath), data);
        });
    });
}

function copyPackageJson() {
    const packageJson = {
        ...JSON.parse(fs.readFileSync("package.json").toString("utf8")),
        engines: undefined,
        packageManager: undefined,
        scripts: undefined,
        devDependencies: undefined,
        main: "lib",
        types: "lib",
    };

    fs.writeFileSync(
        "dist/package.json",
        JSON.stringify(packageJson, null, 2) + "\n",
    );
}

function copyReadme() {
    fs.copyFileSync("README.md", "dist/README.md");
}

function main() {
    createDist();
    copyFiles();
    copyReadme();
    copyPackageJson();
}

main();
