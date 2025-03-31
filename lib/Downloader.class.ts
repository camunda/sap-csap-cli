export class Downloader {
    private to: string;

    constructor() {
        this.to = `${Deno.env.get('TMPDIR') || '/tmp'}/camunda`;
    }
}
