/**
 * Home Assistant related stuff.
 */
const log = require('../log');

const {
    mqttBaseTopic,
    hassDiscoveryPrefix,
} = require('../config');

/**
 * Get frame topic.
 * @param id
 * @returns {string}
 */
function getFrameTopic(id) {
    return `${mqttBaseTopic}/${id}`;
}

/**
 * Get hass value template.
 * @param label
 * @param idLabel
 * @returns {string}
 */
function getValueTemplate({ label, idLabel }) {
    return label === idLabel ? `{{ value_json.${label}.raw }}` : `{{ value_json.${label}.value }}`;
}

/**
 * Publish Configuration for home-assistant discovery.
 * @param client
 * @param id
 * @param frame
 * @param teleinfoService
 */
async function publishConfigurationForHassDiscovery({
    client, id, frame, teleinfoService,
}) {
    const promises = Object.keys(frame).map(async (label) => {
        const discoveryTopic = `${hassDiscoveryPrefix}/sensor/${mqttBaseTopic}/${id}_${label.toLowerCase()}/config`;
        log.info(`Publish configuration for tag ${label} for discovery to topic [${discoveryTopic}]`);
        const stateTopic = getFrameTopic(id);
        return client.publish(discoveryTopic, JSON.stringify({
            unique_id: `teleinfo_${id}_${label}`,
            name: `Teleinfo ${id} ${label}`,
            state_topic: stateTopic,
            state_class: teleinfoService.getHAStateClass(label),
            device_class: teleinfoService.getHADeviceClass(label),
            value_template: getValueTemplate({ label, idLabel: teleinfoService.getIdLabel() }),
            unit_of_measurement: teleinfoService.getHAUnit(label),
            device: {
                identifiers: [id],
                manufacturer: 'Enedis',
                model: `linky_${id}`,
                name: `Linky ${id}`,
            },
        }), {
            retain: true,
        });
    });
    return Promise.all(promises);
}

module.exports = {
    publishConfigurationForHassDiscovery,
};
