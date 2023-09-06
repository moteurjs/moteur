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

function getFiles(nodePath: string): string[] {
    if (!fs.statSync(nodePath).isDirectory()) return [nodePath];

    return fs
        .readdirSync(nodePath)
        .flatMap((node) => getFiles(path.join(nodePath, node)));
}

function copyFiles() {
    const packages = fs.readdirSync("packages");
    const packageFiles = packages.map(
        (pkg) =>
            [
                pkg,
                getFiles(packageDist(pkg))
                    .filter((filePath) => FILE_REGEX.test(filePath))
                    .map((filePath) =>
                        filePath.slice(packageDist(pkg).length + 1),
                    ),
            ] as const,
    );

    packageFiles.forEach(([pkg, files]) => {
        files.forEach((filePath) => {
            console.info("[Pack]", pkg, ">", filePath);

            fs.mkdirSync(path.join("dist", pkg, path.dirname(filePath)), {
                recursive: true,
            });

            const fileDepth = filePath.split("/").length;
            const relativeRoot = new Array(fileDepth).fill("..").join("/");

            const data = fs
                .readFileSync(path.join(packageDist(pkg), filePath))
                .toString("utf8")
                .replaceAll(SOURCE_MAP_REGEX, "")
                .replaceAll("@moteur", relativeRoot);

            fs.writeFileSync(path.join("dist", pkg, filePath), data);
        });
    });
}

function copyPackageJson() {
    const packages = fs.readdirSync("packages");

    const packageJson = {
        ...JSON.parse(fs.readFileSync("package.json").toString("utf8")),
        engines: undefined,
        packageManager: undefined,
        scripts: undefined,
        devDependencies: undefined,
        files: [...packages, "README.md"],
    };

    fs.writeFileSync(
        "dist/package.json",
        JSON.stringify(packageJson, null, 2) + "\n",
    );
    console.info("[Pack] package.json");
}

function copyReadme() {
    fs.copyFileSync("README.md", "dist/README.md");
    console.info("[Pack] README.md");
}

function main() {
    createDist();
    copyFiles();
    copyReadme();
    copyPackageJson();
}

main();
