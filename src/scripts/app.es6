
import UI from './core/ui/ui';

export async function run() {

	console.log('app::run');
	let ui = new UI();
    await ui.init();
    return ui.run();

}

