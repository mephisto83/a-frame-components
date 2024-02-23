import * as root_ from './root';
import * as ui_ from './systems/ui';
import * as painter_ from './systems/react';
import * as line_ from './brushes/line'
import * as rainbox_ from './brushes/rainbow';
import * as single_sphere_ from './brushes/single-sphere';
import * as spheres_ from './brushes/spheres';
import * as stamp_ from './brushes/stamp';
import * as brush_tip_ from './components/brush-tip';
import * as brush_ from './components/brush';
import * as json_model from './components/json-model';
import * as logo_model from './components/logo-model';
import * as blink_controls from './components/blink-controls'
import * as paint_controls from './components/paint-controls';
import * as ui_raycaster from './components/ui-raycaster';
import * as ui from './components/ui';
import * as cubes from './brushes/cubes';
import * as custom_event_set from './components/event-sets';
import * as paint_canvas_ray_listener from './components/paint-canvas-ray-listener'
import * as interactions from './components/interactions'
import * as infinit_list from './components/infinite-list'
import * as interaction_panel from './components/interaction-panel';
import atlas from './atlas';
import gui from '../gui/index';

let registered: any = {}
export default async function painter() {
    if (registered['painter']) {
        return;
    }

    if (!registered['gui']) {
        registered['gui'] = true;
        gui();
    }


    if (!registered['infinit_list']) {
        registered['infinit_list'] = true;
        infinit_list.default();
    }

    if (!registered['interaction_panel']) {
        registered['interaction_panel'] = true;
        interaction_panel.default();
    }

    if (!registered['interactions']) {
        registered['interactions'] = true;
        interactions.default();
    }
    if (!registered['ui_']) {
        registered['ui_'] = true;
        ui_.default();
    }
    if (!registered['cubes']) {
        registered['cubes'] = true;
        cubes.default();
    }
    if (!registered['custom_event_set']) {
        registered['custom_event_set'] = true;
        custom_event_set.default();
    }
    if (!registered['paint_canvas_ray_listener']) {
        registered['paint_canvas_ray_listener'] = true;
        paint_canvas_ray_listener.default()
    }
    if (!registered['spheres_']) {
        spheres_.default()
        registered['spheres_'] = true;
    }
    if (!registered['blink_controls']) {
        blink_controls.default()
        registered['blink_controls'] = true;
    }
    if (!registered['rainbox_']) {
        rainbox_.default()
        registered['rainbox_'] = true;
    }
    if (!registered['single_sphere_']) {
        single_sphere_.default()
        registered['single_sphere_'] = true;
    }
    if (!registered['brush_tip_']) {
        brush_tip_.default()
        registered['brush_tip_'] = true;
    }
    if (!registered['brush_']) {
        brush_.default()
        registered['brush_'] = true;
    }
    if (!registered['paint_controls']) {
        paint_controls.default()
        registered['paint_controls'] = true;
    }
    if (!registered['logo_model']) {
        logo_model.default()
        registered['logo_model'] = true;
    }
    if (!registered['json_model']) {
        json_model.default()
        registered['json_model'] = true;
    }
    if (!registered['ui']) {
        ui.default()
        registered['ui'] = true;
    }
    if (!registered['ui_raycaster']) {
        ui_raycaster.default()
        registered['ui_raycaster'] = true;
    }
    if (!registered['atlas']) {
        registered['atlas'] = true;
        await atlas().then(() => {
            if (!registered['stamp_']) {
                stamp_.default()
                registered['stamp_'] = true;
            }
            if (!registered['line_']) {
                line_.default()
                registered['line_'] = true;
            }
        })
    }
} 